package org.lowcoder.infra.event.group;

import org.lowcoder.infra.event.EventType;

import lombok.experimental.SuperBuilder;

@SuperBuilder
public class GroupCreateEvent extends BaseGroupEvent {

    @Override
    public EventType getEventType() {
        return EventType.GROUP_CREATE;
    }
}
