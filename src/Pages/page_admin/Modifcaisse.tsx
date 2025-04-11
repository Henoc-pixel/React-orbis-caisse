import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Form, Button, Card, Row, Col, InputGroup } from "react-bootstrap";
import { FaSave, FaHome } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import Select, { StylesConfig } from "react-select";
import { User, Caisse } from "@/Components/types";

type UserOption = { value: string; label: string };

const customStyles: StylesConfig<UserOption, false> = {
  control: (base, { isFocused }) => ({
    ...base,
    boxShadow: "none",
    borderColor: isFocused ? "#232754" : base.borderColor,
    "&:hover": {
      borderColor: "#232754",
    },
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    backgroundColor: isSelected ? "#232754" : isFocused ? "#f0f0f0" : "white",
    color: isSelected ? "white" : "black",
    "&:hover": {
      backgroundColor: "#232754",
      color: "white",
    },
  }),
  menu: (base) => ({
    ...base,
    maxHeight: 200,
    overflowY: "auto",
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
};

const ModifCaisse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [code, setCode] = useState<string>("");
  const [intitule, setIntitule] = useState<string>("");
  const [caissier, setCaissier] = useState<string>("");
  const [plafond, setPlafond] = useState<string>("");
  const [managerOptions, setManagerOptions] = useState<UserOption[]>([]);

  useEffect(() => {
    const fetchCaisse = async () => {
      try {
        const response = await fetch(`http://localhost:3000/caisse/${id}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de la caisse.");
        }
        const caisse: Caisse = await response.json();
        setCode(caisse.code);
        setIntitule(caisse.intitulé);
        setCaissier(caisse.username_caissier);
        setPlafond(caisse.plafond);
      } catch (error) {
        console.error("Erreur lors de la récupération de la caisse:", error);
        toast.error("Erreur lors de la récupération de la caisse.");
      }
    };

    const fetchManagers = async () => {
      try {
        const response = await fetch("http://localhost:3000/users");
        const users: User[] = await response.json();
        const managers = users
          .filter(
            (user: User) => user.role === "MANAGER" || user.role === "MANAGER1"
          ) // Ajout du rôle "MANAGER1"
          .map((user) => ({
            value: user.username,
            label: `${user.nom} ${user.prenoms}`,
          }));
        setManagerOptions(managers);
      } catch (error) {
        console.error("Erreur lors de la récupération des managers:", error);
      }
    };

    fetchCaisse();
    fetchManagers();
  }, [id]);

  const handlePlafondChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const formattedValue = Number(value).toLocaleString();
    setPlafond(formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSend = {
      code,
      intitulé: intitule,
      username_caissier: caissier,
      plafond: plafond.replace(/\D/g, ""),
    };

    try {
      const response = await fetch(`http://localhost:3000/caisse/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la modification de la caisse.");
      }

      toast.success("Caisse modifiée avec succès. Redirection en cours...");
      setTimeout(() => navigate("/Dashboard"), 2000);
    } catch (error) {
      console.error("Erreur lors de la modification de la caisse:", error);
      toast.error("Erreur lors de la modification de la caisse.");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Card className="shadow">
        <Card.Header
          className="text-white"
          style={{ backgroundColor: "#232754" }}
        >
          <h6 className="mb-0">Modifier une caisse</h6>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <legend
              className="float-none w-auto px-3 fw-bold"
              style={{ color: "#232754" }}
            >
              <h6>Identification</h6>
            </legend>

            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Code*</Form.Label>
                <Form.Control type="text" value={code} readOnly />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Intitulé*</Form.Label>
                <Form.Control
                  type="text"
                  value={intitule}
                  onChange={(e) => setIntitule(e.target.value)}
                  required
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Caissier*</Form.Label>
                <Select<UserOption>
                  options={managerOptions}
                  value={managerOptions.find(
                    (option) => option.value === caissier
                  )}
                  onChange={(selectedOption) =>
                    setCaissier(selectedOption?.value || "")
                  }
                  placeholder="Sélectionner un caissier..."
                  isSearchable
                  styles={customStyles}
                  required
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>Plafond*</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={plafond}
                    onChange={handlePlafondChange}
                    required
                  />
                  <InputGroup.Text>F.CFA</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Row>

            <div className="d-flex justify-content-end gap-3 button-container">
              <Button type="submit" variant="primary">
                <FaSave size={20} /> Enregistrer
              </Button>
              <Button
                className="btn btn-info btn-custom"
                onClick={() => navigate("/Dashboard")}
              >
                <FaHome size={24} /> Retour
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default ModifCaisse;
