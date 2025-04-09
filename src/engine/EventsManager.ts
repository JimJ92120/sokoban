type EventObject<ElementType> = {
  name: string;
  eventType: string;
  $target: ElementType;
  dataCallback: ($target: ElementType, event?: any) => void;
};

class EventsManager {
  private $eventListener: HTMLElement;
  private eventObjects: EventObject<any>[] = [];

  constructor(eventObjects: EventObject<any>[]) {
    this.$eventListener = document.createElement("div");
    this.eventObjects = eventObjects;

    this.eventObjects.map((eventObject) => {
      const { name, eventType, $target, dataCallback } = eventObject;

      $target.addEventListener(eventType, (event: any) => {
        this.$eventListener.dispatchEvent(
          new CustomEvent(name, {
            detail: dataCallback($target, event),
          })
        );
      });
    });
  }

  addEventListener(eventName: string, callback: (data: any) => void): void {
    this.$eventListener.addEventListener(eventName, (event: any) =>
      callback(event.detail)
    );
  }
}

export default EventsManager;

export { EventObject };
