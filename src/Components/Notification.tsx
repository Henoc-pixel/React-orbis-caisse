import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Card, Container, Badge } from "react-bootstrap";
import {  FaCheck } from "react-icons/fa";
import { Notification } from "@/Components/types";

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/notifications?userId=${userId}`
        );
        const data: Notification[] = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Erreur lors du chargement des notifications:", error);
      }
    };

    fetchNotifications();
  }, [userId]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la notification:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container fluid className="mt-4">
      <Card className="shadow">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4>Mes Notifications</h4>
          <Badge bg="primary" text="white" pill>
            {notifications.filter((n) => !n.read).length} non lues
          </Badge>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Statut</th>
                <th>Message</th>
                <th>Référence</th>
                <th>Date</th>
                <th>Marquer comme lues</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td>
                      {notification.read ? (
                        <span className="text-muted">Lu</span>
                      ) : (
                        <span className="fw-bold text-primary">Non lu</span>
                      )}
                    </td>
                    <td>
                      <Link to={notification.link}>{notification.message}</Link>
                    </td>
                    <td>{notification.reference || "-"}</td>
                    <td>{formatDate(notification.date)}</td>
                    <td>
                      {!notification.read && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => markAsRead(notification.id)}
                          title="Marquer comme lu"
                        >
                          <FaCheck />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center">
                    Aucune notification
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Notifications;
