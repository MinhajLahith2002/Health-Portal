package lk.gamage.backend.healthbridgebackend.service.impl;

import lk.gamage.backend.healthbridgebackend.repository.InsuranceMessageRepository;
import lk.gamage.backend.healthbridgebackend.service.InsuranceMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InsuranceMessageServiceImpl implements InsuranceMessageService {

    private final InsuranceMessageRepository messageRepository;

    @Override
    public long getUnreadMessageCount(String patientId) {
        return messageRepository.countByReceiverIdAndIsReadFalse(patientId);
    }
}
