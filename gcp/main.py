from google.cloud import storage
import tensorflow as tf 
from PIL import Image
import numpy as np 

BUCKET_NAME = "solar-node-tf-models"

class_names = ['Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy']

model = None

# blob - binary large object
# source_blob_name - blob on bucket
# destination_file_name - This function will be running on a different server in google cloud and that server will be downloading 
# the model from the bucket. When the bucket in downloaded locally on that server the "destination_file_name" is the path where the model is stored.
def download_blob(bucket_name,  source_blob_name, destination_file_name):
    storage_client = storage.Client()
    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(source_blob_name)
    blob.download_to_filename(destination_file_name)

def predict(request):
    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    # Set CORS headers for the main request
    headers = {
        'Access-Control-Allow-Origin': '*'
    }

    global model
    if model is None:
        print("I will download the model now")
        download_blob(
            BUCKET_NAME,
            "models/classifier_potato_3.keras", #file name on gcp
            "/tmp/classifier_potato_3.keras" # file path and name where we want to save the model
        )
        model = tf.keras.models.load_model( "/tmp/classifier_potato_3.keras")
        print("model downloaded", model)

    image = request.files["file"]
    image = np.array(Image.open(image))
    # model.predict() function expects an array so we will convert the single image into an array
    img_array = tf.expand_dims(image, 0)

    predictions = model.predict(img_array)
    print(predictions)

    predicted_class = class_names[np.argmax(predictions[0])]
    confidence = round(100*(np.max(predictions[0])), 2)

    return ({"class" : predicted_class, "confidence": confidence}, 200, headers)


