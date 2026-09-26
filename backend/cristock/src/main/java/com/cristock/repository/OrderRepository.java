package com.cristock.repository;

import com.cristock.entity.Order;
import com.cristock.enums.OrderStatus;
import com.cristock.enums.OrderType;
import com.cristock.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUser_IdOrderByCreatedAtDesc(Long userId);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByStatusAndOrderType(
            OrderStatus status,
            OrderType orderType
    );

    List<Order> findByPlayerIdAndStatusAndOrderTypeAndTransactionType(
            Long playerId,
            OrderStatus status,
            OrderType orderType,
            TransactionType transactionType
    );

    List<Order> findByUser_IdAndStatusOrderByCreatedAtDesc(
            Long userId,
            OrderStatus status
    );



    List<Order> findByUser_IdAndPlayer_IdAndStatusAndTransactionType(
            Long userId,
            Long playerId,
            OrderStatus status,
            TransactionType transactionType
    );
}