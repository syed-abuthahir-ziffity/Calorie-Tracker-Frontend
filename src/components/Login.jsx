import { Button, Form, Input, notification } from "antd";
import { useForm } from "antd/es/form/Form";
import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form] = useForm();
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (type, message, description) => {
    api[type]({
      message: message,
      description: description,
    });
  };

  const onFinish = (values) => {
    const baseUrl = process.env.REACT_APP_BASE_URL;
    axios
      .post(`${baseUrl}/login`, values, {
        validateStatus: function (status) {
          return status === 200 || status === 406 || status === 401;
        },
      })
      .then((res) => {
        if (res?.data?.status === "success" && res?.data?.data) {
          let userDataJSON = JSON.stringify(res.data.data);
          localStorage.setItem("userData", userDataJSON);
          localStorage.setItem("token", res.data.token);
          navigate("/calorie-tracker");
        } else {
          openNotificationWithIcon("error", "Error", res.data.message);
        }
      })
      .catch((err) => {
        console.log("Error occured while creating an user as " + err.message);
        openNotificationWithIcon("error", "Error", err.message);
      });
  };

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {contextHolder}
      <Form onFinish={onFinish} className="login-form" form={form}>
        <Form.Item
          name={"username"}
          rules={[
            {
              required: true,
              message: "Please input username",
            },
            {
              min: 3,
              message: "Username should contain minimum 3 characters",
            },
          ]}
        >
          <Input placeholder="Username" />
        </Form.Item>
        <Form.Item
          name={"password"}
          rules={[
            {
              required: true,
              message: "Please input password",
            },
            {
              min: 8,
              message: "Password should contain minimum 8 characters",
            },
          ]}
        >
          <Input.Password type="password" placeholder="Password" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
          >
            Log in
          </Button>
        </Form.Item>
        Not registered? <a href="/register">Register now!</a>
      </Form>
    </div>
  );
};

export default Login;
