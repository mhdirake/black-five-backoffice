FROM docker.iranserver.com/node:26.1.0 as builder
WORKDIR /app
COPY ./package.json ./

ARG NPM_USER
ARG NPM_PASS

RUN printf "registry=https://nexus.gosafir.com/repository/npm-group/\n//nexus.gosafir.com/repository/npm-group/:username=%s\n//nexus.gosafir.com/repository/npm-group/:_password=%s\n//nexus.gosafir.com/repository/npm-group/:email=ci@example.com\n" \
  "$NPM_USER" \
  "$(printf '%s' "$NPM_PASS" | base64 | tr -d '\n')" > /root/.npmrc

RUN npm i 
COPY . . 
RUN npm run build
EXPOSE 3000
CMD [ "npm", "run", "start" ]