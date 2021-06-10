from math import floor
import cv2
import os


class VideoSplitter:

    def __init__(self, path):
        try:
            if not os.path.exists('frame'):
                os.makedirs('frame')
        except OSError:
            print('Error: Creating directory of data')

        self.cap = cv2.VideoCapture(path)

    def create_frames(self, fps=5):
        print(fps)
        currentFrame, currentFrameWrite = 0, 0
        fps_video = self.cap.get(cv2.CAP_PROP_FPS)
        frameCount = self.cap.get(cv2.CAP_PROP_FRAME_COUNT)
        sizeVideo = self.cap.get(cv2.CAP_PROP_FRAME_WIDTH)

        while currentFrame < frameCount:
            ret, frame = self.cap.read()
            if currentFrame % (floor(fps_video / float(fps))) == 0:
                name = './frame/frame' + str(currentFrameWrite) + '.jpg'
                print('Creating...' + name)
                try:
                    cv2.imwrite(name, frame)
                except Exception:
                    break
                currentFrameWrite += 1
            currentFrame += 1

        self.cap.release()
        cv2.destroyAllWindows()
        return sizeVideo
