from node:22-alpine
copy . .
run npm install
#run npm run build
cmd ["node","app.js","--","--host","0.0.0.0:3000"]
