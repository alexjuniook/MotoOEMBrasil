from fastapi import FastAPI

app = FastAPI(title='MotoOEM Brasil')

@app.get('/')
def root():
    return {'status':'ok'}
