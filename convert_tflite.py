import tensorflow as tf
print('Loading Keras model...')
model = tf.keras.models.load_model('nasa_jet_engine_model.keras')
print('Converting to TFLite...')
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS, tf.lite.OpsSet.SELECT_TF_OPS]
converter._experimental_lower_tensor_list_ops = False
tflite_model = converter.convert()
with open('nasa_jet_engine_model.tflite', 'wb') as f:
    f.write(tflite_model)
print('Saved as nasa_jet_engine_model.tflite')
