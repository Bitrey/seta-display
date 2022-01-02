FROM node:16

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package*.json ./

RUN yarn install

# add app
COPY . .

EXPOSE 3000

ENV HOST 0.0.0.0
ENV PORT 3000

# start app
CMD ["yarn", "start"]