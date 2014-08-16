FROM tutum/lamp:latest
RUN rm -fr /app && git clone https://github.com/deanmcpherson/catandglove.git /app
RUN rm -fr /app/press && git clone https://github.com/WordPress/WordPress.git /app/press
EXPOSE 80 3306
CMD ["/run.sh"]