FROM mariadb:11.1.2
# ENV MARIADB_ROOT_PASSWORD root

# RUN apt-get update
# RUN apt-get install -y python
# COPY . /opt/mariadb
ADD Initialize.sql /docker-entrypoint-initdb.d/ddl.sql

# RUN pip install -r /opt/mariadb/requirements.txt

# WORKDIR /opt/mariadb
EXPOSE 3306

# CMD ["uvicorn", "index:app", "--host", "0.0.0.0", "--port=8000", "--reload", "--root-path='/api'"]
# RUN mariadb -uroot -p${MARIADB_ROOT_PASSWORD} < /root/init.sql
