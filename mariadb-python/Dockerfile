FROM python

COPY . /app/server
WORKDIR /app/server

RUN pip install -r requirements.txt

EXPOSE 8000

CMD ["python", "index.py"]
# CMD ["uvicorn", "index:app", "--host", "0.0.0.0", "--port=8000", "--reload", "--root-path='/api'"]
