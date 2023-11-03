FROM nvidia/cuda:12.1.0-runtime-ubuntu20.04

ENV TZ=Asia/Seoul
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/usr/lib:/usr/lib/mariadb
# Set Evaluation Worker
# ENV EVAL_WORKER=2
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
RUN apt update
RUN apt install -y curl wget gcc build-essential git
RUN apt install -y libglib2.0-0 libsm6 libxrender1 libxext6 libgl1-mesa-dev

# RUN git clone https://github.com/FlowerfulFort/RoadToGraduate.git
# RUN chmod a+x RoadToGraduate/prepare_model.sh
# RUN ./RoadToGraduate/prepare_model.sh
RUN apt install -y gdal-bin

RUN wget https://repo.anaconda.com/miniconda/Miniconda3-py310_23.5.2-0-Linux-x86_64.sh
ENV PATH "/miniconda/bin:$PATH"
RUN chmod a+x Miniconda3-py310_23.5.2-0-Linux-x86_64.sh
RUN ./Miniconda3-py310_23.5.2-0-Linux-x86_64.sh -b -f -p /miniconda

RUN conda init
RUN conda update --all
RUN conda install python=3.10

COPY requirements.txt .
# RUN apt install libmariadb-dev
RUN wget https://dlm.mariadb.com/3439454/Connectors/c/connector-c-3.3.7/mariadb-connector-c-3.3.7-ubuntu-focal-amd64.tar.gz -O - | tar -zxf - --strip-components=1 -C /usr
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN pip install numpy pandas==1.5.0 imageio pillow matplotlib opencv-python tensorboardX
RUN pip install torch==1.13.1+cu117 \
                torchvision==0.14.1+cu117 \
                torchaudio==0.13.1 \
                --extra-index-url https://download.pytorch.org/whl/cu117
RUN pip install scipy scikit-learn scikit-image

RUN conda install -c conda-forge gdal

COPY . /app/server
WORKDIR /app/server/app

RUN git clone https://github.com/FlowerfulFort/RoadToGraduate.git
RUN chmod a+x RoadToGraduate/prepare_model.sh
RUN ./RoadToGraduate/prepare_model.sh

WORKDIR /app/server
RUN chmod a+x startup.sh
EXPOSE 8000

CMD ["./startup.sh"]
# CMD ["uvicorn", "index:app", "--host", "0.0.0.0", "--port=8000", "--reload", "--root-path='/api'"]
