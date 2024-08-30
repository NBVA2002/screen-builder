package org.lowcoder.sdk.auth;

import static org.lowcoder.sdk.auth.constants.AuthTypeConstants.FORM;
import static org.lowcoder.sdk.constants.AuthSourceConstants.EMAIL;

import javax.annotation.Nullable;

import com.fasterxml.jackson.annotation.JsonCreator;

import lombok.Getter;

@Getter
public class EmailAuthConfig extends AbstractAuthConfig {

    @JsonCreator
    public EmailAuthConfig(@Nullable String id, boolean enable, boolean enableRegister) {
        super(id, EMAIL, EMAIL, enable, enableRegister, FORM);
    }
}
