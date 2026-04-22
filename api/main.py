from fastapi import FastAPI, File, UploadFile
import numpy as np
import uvicorn
from io import BytesIO
from PIL import Image
import tensorflow as tf

app = FastAPI()

## Use this for fast api
MODEL = tf.keras.models.load_model(
    "../saved_model/1",
    compile=False
)

# beta_model =  tf.keras.models.load_model(
#     "../saved_model/2",
#     compile=False
# )


CLASS_NAMES = ['Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy']

@app.get("/ping")
async def ping():
    return "hello i am alive"

def read_file_as_image(data) -> np.ndarray:
    # image is 1D array but the model expects 2D array
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):
    # bytes = await file.read()
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)
    predictions = MODEL.predict(img_batch )
    predicted_class = CLASS_NAMES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])  #confidence

    return {
        'class' : predicted_class,
        'confidence' : float(confidence)
    }

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)