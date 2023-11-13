FROM python:3.10.7-slim-buster


COPY . /app/

WORKDIR /app/
RUN apt update
RUN apt install -y python3-dev gcc openssl libmariadb-dev
RUN pip install --upgrade pip
RUN pip install --no-cache-dir packaging
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install  --no-cache-dir gunicorn
EXPOSE 8000/udp
EXPOSE 8000/tcp
COPY ./start.sh /app/start.sh
COPY ./healthchecker.py /app/healthchecker.py
RUN chmod +x /app/start.sh
HEALTHCHECK --interval=1m --timeout=3s \
    CMD ["python","/app/healthchecker.py"] || exit 1

CMD ["/app/start.sh"]
