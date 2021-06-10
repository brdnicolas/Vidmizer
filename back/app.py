import os
from flask_cors import CORS
from flask import Flask, request, jsonify, send_from_directory
import enum
import requests
from base64 import b64decode
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from azure.cognitiveservices.vision.face import FaceClient
from msrest.authentication import CognitiveServicesCredentials
from dotenv import load_dotenv
import re
from zipfile import ZipFile
from os.path import basename
from splitVideo import VideoSplitter
from ContentType import ContentType
from werkzeug.datastructures import FileStorage
from azure.cognitiveservices.vision.contentmoderator import ContentModeratorClient
import azure.cognitiveservices.vision.contentmoderator.models
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials

load_dotenv('.creditentials')

for endpoint in ["FACE_ENDPOINT", "VISION_ENDPOINT", "MODERATE_ENDPOINT"]:
    if re.search(r"https://.*cognitiveservices.azure.com", os.getenv("FACE_ENDPOINT")) is None:
        if endpoint != 'MODERATE_ENDPOINT':
            exit("Bad format for endpoint {}".format(endpoint))

try:
    face_client = FaceClient(os.getenv("FACE_ENDPOINT"),
                             CognitiveServicesCredentials(os.getenv("FACE_SUBSCRIPTION_KEY")))
    face_client.snapshot.list()
    vision_client = ComputerVisionClient(os.getenv("VISION_ENDPOINT"),
                                         CognitiveServicesCredentials(os.getenv("VISION_SUBSCRIPTION_KEY")))
    vision_client.list_models()
except:
    exit('Bad Subscription Key for Face API or ComputeVision API')

try:
    moderate_client = ContentModeratorClient(os.getenv("MODERATE_ENDPOINT"),
                                             CognitiveServicesCredentials(os.getenv("MODERATE_SUBSCRIPTION_KEY")))
except ValueError:
    print('Moderate API Key not found')

app = Flask(__name__, static_folder='static')
CORS(app)

image_title = 'image_0'


app.config['VIDEO_UPLOADS'] = "./video"
app.config['ANALYZE_VIDEO'] = "./static/video"
app.config['ANALYZE_IMAGE'] = "./static/image"
app.config['FRAME'] = "./frame"
image_title = "image_0"


def increment_title(title=image_title):
    count = int(title.split('_')[1]) + 1
    return "image_{}".format(count)


def relative_path(name, analyse_str):
    return app.config['ANALYZE_{}'.format(analyse_str)] + '/' + name + '.png'


@app.route('/')
@app.errorhandler(404)
def resource_not_found(e):
    return jsonify(error=str(e)), 404


def id_all_faces(content_type, string_arg):
    detected_faces = []
    if content_type == ContentType.STREAM:
        img = request.form[string_arg]
        # Permet de parse la Data URI pour isoler le format et les BinaryData du fichier
        header, encoded = img.split(",", 1)
        extension = img.split(",")[0].split("/")[1].split(";")[0]
        data = b64decode(encoded)
        with open("static/image/img." + extension, "wb") as f:
            f.write(data)

        # La variable f étant un Temporary Buffer lors de la création de l'image, il faut le réouvrir une fois créer pour pouvoir envoyer le FileReader au FileStorage()
        file = open("static/image/img." + extension, "rb")
        detected_faces = request_bin(FileStorage(file))
    elif content_type == ContentType.URL:
        detected_faces = request_url(request.form[string_arg])
    if not detected_faces:
        return 'no'
    json = {}
    for face in detected_faces: json[(len(json)) + 1] = face.face_id
    return json


def request_bin(image):
    return face_client.face.detect_with_stream(image=image)


def request_url(url):
    return face_client.face.detect_with_url(url=url)


@app.route('/upload/img', methods=['POST'])
def upload_img():
    if request.method == 'POST':
        img = request.form['img']
        header, encoded = img.split(",", 1)
        extension = img.split(",")[0].split("/")[1].split(";")[0]
        data = b64decode(encoded)
        with open("download/img." + extension, "wb") as f:
            f.write(data)
    return 'img saved'


@app.route('/id/bin', methods=['POST', 'GET'])
def id_bin():
    if request.method == 'POST':
        return id_all_faces(ContentType.STREAM, 'face-image')


@app.route('/id/url', methods=['POST', 'GET'])
def id_url():
    if request.method == 'POST':
        return id_all_faces(ContentType.URL, 'face-url')


def getRectangle(faceDictionary):
    rect = faceDictionary.face_rectangle
    left = rect.left
    top = rect.top
    right = left + rect.width
    bottom = top + rect.height

    return (left, top), (right, bottom)


@app.route('/find/url/url', methods=['POST', 'GET'])
def find_url():
    if request.method == 'POST':
        return find_all(ContentType.URL, ContentType.URL)


@app.route('/find/image/image', methods=['POST', 'GET'])
def find_image():
    if request.method == 'POST':
        return find_all(ContentType.STREAM, ContentType.STREAM)


@app.route('/download/video', methods=['GET'])
def download_compress_dir_video():
    return download_compress_dir('ANALYZE_VIDEO')


@app.route('/download/image', methods=['GET'])
def download_compress_dir_image():
    return download_compress_dir('ANALYZE_IMAGE')


def download_compress_dir(type_upload):
    with ZipFile('result.zip', 'w') as zipObj:
        for folder, subfolder, filenames in os.walk(app.config[type_upload]):
            for file in filenames:
                filePath = os.path.join(folder, file)
                zipObj.write(filePath, basename(filePath))
    return send_from_directory('./', 'result.zip', as_attachment=True)


def find_all(CType_toFind, CType_toSearch):
    global image_title
    init_directories()
    first_image_face_ID = id_all_faces(ContentType.URL, 'face-url')[1] if CType_toFind == ContentType.URL \
        else id_all_faces(ContentType.STREAM, 'face-url')[1]
    if first_image_face_ID == "o":
        return "No face detected from image"
    img = request.form['multi-face-url']
    header, encoded = img.split(",", 1)
    extension = img.split(",")[0].split("/")[1].split(";")[0]
    data = b64decode(encoded)
    with open("static/image/img." + extension, "wb") as f:
        f.write(data)
    detected_faces2 = request_url(request.form['multi-face-url']) if CType_toSearch == ContentType.URL \
        else request_bin(open("static/image/img." + extension, "rb"))
    if not detected_faces2:
        return "No face detected from other image"
    second_image_face_IDs = list(map(lambda x: x.face_id, detected_faces2))
    similar_faces = face_client.face.find_similar(face_id=first_image_face_ID, face_ids=second_image_face_IDs)
    if not similar_faces:
        return 'nothing to see here'
    img = Image.open("static/image/img." + extension) if CType_toSearch == ContentType.STREAM \
        else Image.open(BytesIO(requests.get(request.form['multi-face-url']).content))
    draw = ImageDraw.Draw(img)
    for face in similar_faces:
        face_info = next(x for x in detected_faces2 if x.face_id == face.face_id)
        font = get_font(face_info.face_rectangle.width * 2)
        draw_rectangle(face_info, draw, font)
    img.save(relative_path(image_title, 'IMAGE'))
    image_info = get_evaluation(relative_path(image_title, 'IMAGE'))
    path_image = image_title
    image_title = increment_title(image_title)
    return {
        "image": path_image,
        "infos": image_info['description']
    }


def init_directories():
    folders = [app.config['VIDEO_UPLOADS'], app.config['FRAME'], app.config['ANALYZE_VIDEO'],
               app.config['ANALYZE_IMAGE']]
    try:
        for folder in folders:
            files = os.listdir(folder)
            for i in range(0, len(files)):
                os.remove(folder + '/' + files[i])
    except OSError as e:
        print(e)
        pass
    for folder in folders:
        if not os.path.exists(folder):
            os.makedirs(folder)
    print('directories refreshed')


def create_frames():
    if not request.files:
        return 'no video found'
    video = request.files['video']
    video.save(os.path.join(app.config['VIDEO_UPLOADS'], video.filename))
    sizeVideo = VideoSplitter(app.config['VIDEO_UPLOADS'] + '/' + video.filename).create_frames(
        request.form.get('fps', "5"))
    return sizeVideo


def get_font(sizeVideo):
    fontsize = 1
    name = request.form.get('visage-name', "")
    if name == "": return None
    font = ImageFont.truetype('arial.ttf', fontsize, encoding="utf-8")
    while font.getsize(name)[0] < 0.20 * sizeVideo:
        fontsize += 1
        font = ImageFont.truetype("arial.ttf", fontsize, encoding="utf-8")
    return {'font': font, 'name': name, 'fontsize': fontsize}


def get_file_detected_faces(filename):
    with open(filename, 'rb') as fp:
        file = FileStorage(fp)
        return request_bin(file)


def get_file_evaluation(filename):
    with open(filename, 'rb') as fp:
        file = FileStorage(fp)
        return vision_client.analyze_image_in_stream(file, visual_features=['description', 'adult']).as_dict()


def draw_rectangle(face_info, draw, font):
    rect = getRectangle(face_info)
    draw.rectangle(rect, outline='red')
    if font is not None:
        print('drawing name')
        draw.text((rect[0][0], rect[0][1] - font['fontsize']), font['name'], fill="red", font=font['font'])


def get_evaluation(path):
    evaluation = get_file_evaluation(path)
    if evaluation['adult']['is_adult_content'] or \
            evaluation['adult']['is_racy_content']:
        return 'adult content found'
    return evaluation


@app.route('/similar/url/video', methods=['POST', 'GET'])
def find_similar():
    global image_title
    if request.method == 'POST':
        pics_informations, pics_name = {}, []
        first_image_face_ID = id_all_faces(ContentType.STREAM, 'face-url')[1]
        if first_image_face_ID == 'o': return 'No face detected in image'
        init_directories()
        create_frames()
        font = 1
        firstFrame = True
        for filename in os.listdir(app.config['FRAME']):
            detected_faces = get_file_detected_faces('{}/{}'.format(app.config['FRAME'], filename))
            evaluation = get_evaluation('{}/{}'.format(app.config['FRAME'], filename))
            if evaluation == 'adult content found':
                return 'adult content found'
            if not detected_faces:
                print('No detected faces for {}'.format(filename))
                continue
            second_image_face_IDs = list(map(lambda x: x.face_id, detected_faces))
            similar_faces = face_client.face.find_similar(face_id=first_image_face_ID, face_ids=second_image_face_IDs)
            if not similar_faces:
                print('No similar face for {}'.format(filename))
                continue
            img = Image.open(app.config['FRAME'] + '/' + filename)
            draw = ImageDraw.Draw(img)
            for face in similar_faces:
                face_info = next(x for x in detected_faces if x.face_id == face.face_id)
                if firstFrame:
                    font = get_font(face_info.face_rectangle.width * 2)
                    firstFrame = False
                draw_rectangle(face_info, draw, font)
            img.save(relative_path(image_title, 'VIDEO'))
            pics_informations[image_title] = evaluation['description']
            pics_name.append(image_title)
            image_title = increment_title(image_title)
        return {
            "images": pics_name,
            "infos": pics_informations
        }
    return 'post only'


if __name__ == '__main__':
    app.run(host='0.0.0.0')
