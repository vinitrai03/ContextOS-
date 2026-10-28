package com.contextos.service.email;

import com.contextos.model.Email;

public interface EmailSender {
    void sendEmail(Email email);
}
