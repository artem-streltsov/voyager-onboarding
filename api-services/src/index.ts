import app from "./app";

const PORT = 8080

const server = app.listen(PORT, ()=> {
  console.log(`Api service is running on port:${PORT}`)
})


export default server
