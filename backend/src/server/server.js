// -----------------------------------------------------------------------------
// Dependencies
// -----------------------------------------------------------------------------
import express from 'express';
import url from 'url';
import path from "path";
// -----------------------------------------------------------------------------
// Environmental Variables && Constants
// -----------------------------------------------------------------------------
const PORT = process.env.PORT ? process.env.PORT : 1337;

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------
// Setup the main application stack
const app = express();
// Find the path to the staic file folder
const filePath = url.fileURLToPath(import.meta.url);
const serverPath = path.dirname(filePath);
const publicPath = path.join(serverPath, "public"); 

// -----------------------------------------------------------------------------
// Web Server
// -----------------------------------------------------------------------------
app.use(express.static(publicPath));
app.get("/", (request, response) => {
    response.sendFile(path.join(publicPath, "client.html"));
});

app.get("/:route", (request, response) => {
    response.send(`postgres-node-dev-template: server.js ${request.params.route}`);
});

// -----------------------------------------------------------------------------
// Deployment
// -----------------------------------------------------------------------------
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));