import r2wc from '@r2wc/react-to-web-component';
import { LowcoderAppView } from 'lowcoder';

type AppViewProp = {
  appId: string;
  baseUrl: string;
  input: Record<string, any>;
  eventTriggerName: string;
  outputEventName: string;
}

export function ReactDemoApp({ appId, baseUrl, input, eventTriggerName, outputEventName }: AppViewProp) {
  if (!appId || !baseUrl) {
    return null;
  }

  const emitEvent = (eventName: string, payload: any) => {
    const event = new CustomEvent(eventName, {
      detail: payload,
    });

    document.dispatchEvent(event);
  }

  return (
    <div>
      <LowcoderAppView
        appId={appId}
        baseUrl={baseUrl}
        moduleInputs={input}
        onModuleEventTriggered={(name) => {
          emitEvent(eventTriggerName, name);
        }}
        onModuleOutputChange={(output) => {
          emitEvent(outputEventName, output);
        }}
      />
    </div>
  );
}

customElements.define("screen-renderer", r2wc(ReactDemoApp, { props: { appId: "string", baseUrl: "string", input: "json", eventTriggerName: "string", outputEventName: "string" } }));
