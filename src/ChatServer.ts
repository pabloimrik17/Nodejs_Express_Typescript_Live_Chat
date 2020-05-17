import * as express from "express";
import * as http from "http";
import * as socketIo from "socket.io";
import * as cors from "cors";
import { Application } from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import ChatEvent from "./constants";
import ChatMessage from "./types";

class ChatServer {
    public static readonly DEFAULT_PORT: number = 8080;

    private _app: Application;
    private server: http.Server;
    private io: Server;
    private port: string | number;

    get app(): Application {
        return this._app;
    }

    constructor() {
        this._app = express();
        this.port = process.env.PORT || ChatServer.DEFAULT_PORT;
        this._app.use(cors());
        this._app.options("*", cors());
        this.server = createServer(this._app);
        this.initSocket();
        this.listen();
    }

    private initSocket (): void {
        this.io = socketIo(this.server);
    }

    private async listen (): Promise<void> {
        try {
            await this.server.listen(this.port);
            console.log(`Running server on port ${this.port}`);

            this.io.on(ChatEvent.CONNECT, (socket) => {
                console.log(`Connected client on port ${this.port}`);

                socket.on(ChatEvent.MESSAGE, (message: ChatMessage) => {
                    console.log(`[server](message): ${JSON.stringify(message)} `);
                    this.io.emit("message", message);
                });

                socket.on(ChatEvent.DISCONNECT, () => {
                    console.log("Client disconnected");
                })
            })
        } catch (e) {
            console.error(e);
        }
    }
}

export default ChatServer;
