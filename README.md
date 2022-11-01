# Bank, node-express exercise

## Desafío

Ejemplo de proyecto en Node / express desarrollado en una sesión de ADL. Incluye despliegue con Docker.

Instrucciones [aquí](https://github.com/sebavidal10/adl-bank-node-express-exercise/blob/main/Caso%20Full%20Stack%20Developer%20Javascript.pdf)

## Despliegue

### Dockerfile

Crear la imagen desde dentro del directorio  
`docker build . -t node-bank-example:latest`

Crear el contenedor incorporando las variables necesarias (estan en .env.example), para esto postgresql debe estar corriendo y la bd banco debe existir. Mas detalles de la bd en el archivo bd.sql  
`docker run -d --name bank-example -p 3000:3000 -e POSTGRES_USER='' -e POSTGRES_PASSWORD='' -e POSTGRES_DB='banco' -e DB_HOST='' -e DB_PORT=5432 node-bank-example`

### docker-compose

Docker compose nos hace todo mas facil, se crean los contenedores y se vinculan, mas detalles en el archivo `docker-compose`

`docker-compose up`  
`docker-compose down`
