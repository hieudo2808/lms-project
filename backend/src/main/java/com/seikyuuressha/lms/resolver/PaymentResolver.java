package com.seikyuuressha.lms.resolver;

import com.seikyuuressha.lms.dto.request.InitiatePaymentRequest;
import com.seikyuuressha.lms.dto.response.PaymentResponse;
import com.seikyuuressha.lms.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.ContextValue;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class PaymentResolver {

    private final PaymentService paymentService;

    @QueryMapping
    public List<PaymentResponse> getMyPayments() {
        return paymentService.getMyPayments();
    }

    @QueryMapping
    public PaymentResponse getPaymentByTransaction(@Argument String transactionId) {
        return paymentService.getPaymentByTransaction(transactionId);
    }

    @MutationMapping
    public PaymentResponse initiatePayment(@Argument InitiatePaymentRequest input, 
                                          @ContextValue HttpServletRequest request) {
        return paymentService.initiatePayment(input, request);
    }

    @MutationMapping
    public PaymentResponse confirmPayment(@Argument String transactionId, 
                                         @Argument Map<String, String> params) {
        return paymentService.confirmPayment(transactionId, params);
    }
}
