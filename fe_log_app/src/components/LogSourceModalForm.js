import { Formik } from "formik";
import React, { useRef, useState, useEffect } from "react";
import { Button, Container, Form, Alert, Modal } from "react-bootstrap";
import { NotificationManager } from "react-notifications";
import * as Yup from "yup";
import { useCreateSourceMutation } from "../services/sourceService";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "../redux/slices/authSlice";
import { createSource } from "../redux/slices/sourceSlice";

const sourceSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short! Minimun legth is 2 characters long")
    .max(50, "Too Long! Maximum legth is 50 characters long")
    .required("Source name is required"),
});
const initialFormValues = {
  name: "",
};

const LogSourceForm = (props) => {
  const [createSourceMutation, { isLoading }] = useCreateSourceMutation();

  let user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const [errMsg, setErrMsg] = useState("");
  const errRef = useRef();

  const closeButtonClickHandler = () => {
    props.onHide();
  };

  const handleAddLogSourceFormSubmit = async (values) => {
    try {
      const source = await createSourceMutation({
        name: values.name,
        user: user["id"],
      }).unwrap();

      dispatch(createSource({ ...source }));
      setErrMsg();
      closeButtonClickHandler();
      NotificationManager.success(
        `Source '${source.name}'is added successfully.`,
        "Successfully Added",
        4000
      );
    } catch (err) {
      console.log(err);
      if (!err?.status) {
        // isLoading: true until timeout occurs
        setErrMsg({"error":"No Server Response"});
      } else if (err.status === 400 || err.status === 401) {
        setErrMsg(err.data);
      } else if (err.status === 404) {
        setErrMsg({ error: "Source add URL not found" });
      } else {
        setErrMsg({ error: "Adding log source failed" });
      }
      errRef.current.focus();
    }
  };
  return (
    <>
      <Modal show={props.show} onHide={closeButtonClickHandler}>
        <Modal.Header closeButton>
          <Modal.Title>Add Log Source</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container ref={errRef}>
            {errMsg && (
              <Alert
                variant="danger"
                className={errMsg ? "errmsg" : "offscreen"}
                aria-live="assertive"
              >
                <ul>
                  {Object.keys(errMsg).map((item, index) =>
                    String(errMsg[item]).toLowerCase() ==
                    "The fields name, user must make a unique set.".toLowerCase() ? (
                      <li key={index}>Source name should be unique</li>
                    ) : (
                      <li key={index}>{errMsg[item]}</li>
                    )
                  )}
                </ul>
              </Alert>
            )}
          </Container>
          <Formik
            validationSchema={sourceSchema}
            onSubmit={(values) => {
              handleAddLogSourceFormSubmit(values);
            }}
            initialValues={initialFormValues}
          >
            {({
              handleSubmit,
              handleChange,
              handleBlur,
              values,
              isSubmitting,
              touched,
              isValid,
              errors,
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                {/* source name */}
                <Form.Group controlId="name">
                  <Form.Label>
                    Source name<span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Source name"
                    value={values.name}
                    onChange={handleChange}
                    disabled={isLoading}
                    isInvalid={!!errors.name}
                    aria-describedby="name-message"
                  />
                  <Form.Control.Feedback id="name-message" type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
                <br />
                <Container className="d-flex justify-content-center">
                  <Button
                    variant="primary w-100"
                    type="submit"
                    name="Add"
                    disabled={isLoading}
                  >
                    ADD
                    {isLoading ? (
                      <div
                        className="spinner-border spinner-border-sm text-light"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      ""
                    )}
                  </Button>
                </Container>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LogSourceForm;
