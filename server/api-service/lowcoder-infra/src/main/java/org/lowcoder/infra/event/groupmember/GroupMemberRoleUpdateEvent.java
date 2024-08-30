package org.lowcoder.infra.event.groupmember;

import org.lowcoder.infra.event.EventType;

import lombok.experimental.SuperBuilder;

@SuperBuilder
public class GroupMemberRoleUpdateEvent extends BaseGroupMemberEvent {

    @Override
    public EventType getEventType() {
        return EventType.GROUP_MEMBER_ROLE_UPDATE;
    }
}
