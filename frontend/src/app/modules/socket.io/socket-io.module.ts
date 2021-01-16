import { NgModule, ModuleWithProviders, InjectionToken } from "@angular/core";
import { SocketIoConfig, WrappedSocket } from "./socket.io.service";

export function SocketFactory(config: SocketIoConfig): WrappedSocket {
  return new WrappedSocket(config);
}

export const SOCKET_CONFIG_TOKEN = new InjectionToken<SocketIoConfig>(
  "__SOCKET_IO_CONFIG__"
);

@NgModule({})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SocketIoModule {
  static forRoot(config: SocketIoConfig): ModuleWithProviders<SocketIoModule> {
    return {
      ngModule: SocketIoModule,
      providers: [
        { provide: SOCKET_CONFIG_TOKEN, useValue: config },
        {
          provide: WrappedSocket,
          useFactory: SocketFactory,
          deps: [SOCKET_CONFIG_TOKEN],
        },
      ],
    };
  }
}
