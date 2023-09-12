import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  DatePicker,
  Form,
  Input,
  Layout,
  Modal,
  Select,
  Table,
  notification,
} from "antd";
import { Content, Header } from "antd/es/layout/layout";
import { useNavigate } from "react-router-dom";
import { useForm } from "antd/es/form/Form";
import axios from "axios";
import moment from "moment";
import { hasFormSubmit } from "@testing-library/user-event/dist/utils";

const CalorieTable = () => {
  let userData = JSON.parse(localStorage.getItem("userData"));
  const formInitialValue = [
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Form.Item
        name={`food_item-0`}
        rules={[
          {
            required: true,
            message: "Please input food item",
          },
        ]}
      >
        <Input placeholder="Food Item" style={{ width: 350 }} />
      </Form.Item>
      <Form.Item
        name={`calorie-0`}
        rules={[
          {
            required: true,
            message: "Please input calorie",
          },
          {
            pattern: /^[0-9]+$/,
            message: "Field must contain only numbers",
          },
        ]}
      >
        <Input type="number" placeholder="Calorie" style={{ width: 350 }} />
      </Form.Item>
      <Form.Item
        name={`price-0`}
        rules={[
          {
            required: true,
            message: "Please input price",
          },
          {
            pattern: /^[0-9]+$/,
            message: "Field must contain only numbers",
          },
        ]}
      >
        <Input type="number" placeholder="Price" style={{ width: 350 }} />
      </Form.Item>
    </div>,
  ];
  const [open, setOpen] = useState(false);
  const [form] = useForm();
  const [formFilter] = useForm();
  const [formEdit] = useForm();
  const [formElements, setFormElements] = useState(formInitialValue);
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const baseUrl = process.env.REACT_APP_BASE_URL;
  const [itemData, setItemData] = useState([]);
  const [disabledDates, setdisabledDates] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editFormDate, setEditFormDate] = useState("");
  const [editFormData, setEditFormData] = useState([]);
  const [editId, setEditId] = useState("");
  const [spendings, setSpendings] = useState(0);
  const EditForm = () => (
    <>
      <Form
        name="edit_form"
        fields={editFormData}
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
        }}
        form={formEdit}
        onFinish={handleEditFormSubmit}
      >
        <Form.Item style={{ width: "100%" }}>
          <Input
            disabled
            value={moment(editFormDate).format("YYYY-MM-DD")}
            name="date"
          />
        </Form.Item>
        {editFormData.map((field, index) => (
          <Form.Item
            name={field.name}
            style={{ width: "33%" }}
            rules={[
              {
                required: true,
                message: field.name.includes("food_item")
                  ? "Please input food item"
                  : field.name.includes("calorie")
                  ? "Please input calorie"
                  : "Please input price",
              },
            ]}
          >
            <Input
              placeholder={field.name}
              type={!field.name.includes("food_item") ? "number" : ""}
            />
          </Form.Item>
        ))}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Form.Item>
      </Form>
    </>
  );

  //Fetch data for the calorie table.
  const fetchData = () => {
    axios
      .get(`${baseUrl}/items/${userData.id}`)
      .then((res) => {
        if (res?.data?.status === "success") {
          let structuredData = [];
          let fetchedItemsArray = res.data.data;
          fetchedItemsArray.forEach((element) => {
            let rowObject = {};
            rowObject.id = element.id;
            rowObject.user_id = element.user_id;
            rowObject.date = element.date;
            rowObject.food_items = element.food_items;
            let itemCaloriesArray = element.calories.toString().includes(",")
              ? element.calories.split(",")
              : [element.calories];
            let itemPricesArray = element.prices.toString().includes(",")
              ? element.prices.split(",")
              : [element.prices];
            rowObject.totalCalories = itemCaloriesArray.reduce(
              (accumulator, currentValue) => {
                return parseFloat(accumulator) + parseFloat(currentValue);
              },
              0
            );
            rowObject.totalPrices = itemPricesArray.reduce(
              (accumulator, currentValue) => {
                return parseFloat(accumulator) + parseFloat(currentValue);
              },
              0
            );
            structuredData.push(rowObject);
          });
          setItemData(structuredData);
        } else {
          openNotificationWithIcon("error", "Error", res.data.message);
        }
      })
      .catch((err) => {
        console.log("Error occured while fetching items as " + err.message);
        openNotificationWithIcon("error", "Error", err.message);
      });
  };

  //Configurations for the AntD table.
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      width: 150,
    },
    {
      title: "Food Items",
      dataIndex: "food_items",
      width: 250,
    },
    {
      title: "Total Calories",
      dataIndex: "totalCalories",
      width: 150,
      render: (totalCalories) => ({
        props: {
          style: {
            background: getBgColorForCalorieCell(totalCalories),
          },
        },
        children: <div>{totalCalories}</div>,
      }),
    },
    {
      title: "Total Price",
      dataIndex: "totalPrices",
      width: 150,
    },
    {
      title: "Actions",
      dataIndex: "id",
      width: 150,
      render: (id, record) => (
        <Button onClick={() => handleRowEdit(id)}>
          <i className="fa fa-edit" aria-hidden="true"></i>
        </Button>
      ),
    },
  ];

  //Background color based on the total calorie value
  const getBgColorForCalorieCell = (totalCalories) => {
    if (totalCalories > 2100) {
      return "#ee9090";
    } else {
      return "rgb(144 238 160)";
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getSpendings = (month) => {
    let currentMonth = month ? month : new Date().getMonth() + 1;
    axios
      .get(`${baseUrl}/spendings/${userData.id}/${currentMonth}`)
      .then((res) => {
        if (res?.data?.status === "success") {
          setSpendings(res.data.data);
        } else {
          openNotificationWithIcon("error", "Error", res.data.message);
        }
      })
      .catch((err) => {
        console.log("Error occured while fetching spendings as " + err.message);
        openNotificationWithIcon("error", "Error", err.message);
      });
  };
  useEffect(() => {
    getSpendings();
  }, []);

  //Using AntD notifications.
  const openNotificationWithIcon = (type, message, description) => {
    api[type]({
      message: message,
      description: description,
    });
  };

  //Handling the post request of the modal form to backend.
  const onFinish = () => {
    const formValues = form.getFieldsValue();
    let transformedData = {};
    transformedData.date = moment(new Date(formValues.date)).format(
      "YYYY-MM-DD"
    );
    let food_items = [];
    let calories = [];
    let prices = [];
    for (let i = 0; i < formElements.length; i++) {
      food_items.push(formValues[`food_item-${i}`]);
      calories.push(formValues[`calorie-${i}`]);
      prices.push(formValues[`price-${i}`]);
    }
    transformedData.food_items = food_items.toString();
    transformedData.calories = calories.toString();
    transformedData.prices = prices.toString();
    axios
      .post(`${baseUrl}/items/${userData.id}`, transformedData, {
        validateStatus: function (status) {
          return status === 200 || status === 201 || status === 406;
        },
      })
      .then((res) => {
        if (res?.data?.status === "success") {
          setOpen(false);
          filterReset();
          form.resetFields();
          setFormElements(formInitialValue);
          openNotificationWithIcon("success", "Success", res.data.message);
        } else {
          openNotificationWithIcon("error", "Error", res.data.message);
        }
      })
      .catch((err) => {
        console.log("Error occured while inserting items as " + err.message);
        openNotificationWithIcon("error", "Error", err.message);
      });
  };

  //Handling the post request of the filter form to backend
  const filterSubmit = (values) => {
    if (values.month === undefined || values.month === 12) {
      values.month = "all";
    } else {
      values.month = Number(values.month) + 1;
      getSpendings(values.month);
    }
    if (values.search === undefined || values.search === "") {
      values.search = "all";
    }
    axios
      .get(`${baseUrl}/items/${userData.id}/${values.month}/${values.search}`)
      .then((res) => {
        if (res?.data?.status === "success") {
          let filteredData = [];
          let filteredItemsArray = res.data.data;
          filteredItemsArray.forEach((element) => {
            let rowObject = {};
            rowObject.id = element.id;
            rowObject.date = element.date;
            rowObject.food_items = element.food_items;
            let itemCaloriesArray = element.calories.toString().includes(",")
              ? element.calories.split(",")
              : [element.calories];
            let itemPricesArray = element.prices.toString().includes(",")
              ? element.prices.split(",")
              : [element.prices];
            rowObject.totalCalories = itemCaloriesArray.reduce(
              (accumulator, currentValue) => {
                return parseFloat(accumulator) + parseFloat(currentValue);
              },
              0
            );
            rowObject.totalPrices = itemPricesArray.reduce(
              (accumulator, currentValue) => {
                return parseFloat(accumulator) + parseFloat(currentValue);
              },
              0
            );
            filteredData.push(rowObject);
          });
          setItemData(filteredData);
        } else {
          openNotificationWithIcon("error", "Error", res.data.message);
        }
      })
      .catch((err) => {
        console.log("Error occured while fetching items as " + err.message);
        openNotificationWithIcon("error", "Error", err.message);
      });
  };

  //Filter form fields reset
  const filterReset = () => {
    formFilter.setFieldValue("search", "");
    formFilter.setFieldValue("month", 12);
    fetchData();
    getSpendings();
  };

  //Handling the edit of row values
  const handleRowEdit = (itemId) => {
    setEditId(itemId);
    axios
      .get(`${baseUrl}/item/${userData.id}/${itemId}`)
      .then((res) => {
        console.log(res.data);
        if (res?.data?.status === "success") {
          let structuredData = [];
          let resultObject = res?.data?.data[0];
          let foodItemsArray = resultObject?.food_items.split(",");
          let caloriesArray = resultObject?.calories.split(",");
          let pricesArray = resultObject?.prices.split(",");
          if (
            foodItemsArray.length === caloriesArray.length &&
            caloriesArray.length === pricesArray.length
          ) {
            for (let i = 0; i < foodItemsArray.length; i++) {
              structuredData.push({
                name: `food_item-${i}`,
                value: foodItemsArray[i],
              });
              structuredData.push({
                name: `calorie-${i}`,
                value: caloriesArray[i],
              });
              structuredData.push({ name: `price${i}`, value: pricesArray[i] });
            }
          }
          setEditFormDate(resultObject.date);
          setEditFormData(structuredData);
        } else {
          openNotificationWithIcon("error", "Error", res.data.message);
        }
      })
      .catch((err) => {
        console.log("Error occured while fetching item as " + err.message);
        openNotificationWithIcon("error", "Error", err.message);
      });
    setOpenEdit(true);
  };

  //Handle Edit forn submit

  const handleEditFormSubmit = (values) => {
    const transformedItem = {
      foodItems: [],
      calories: [],
      prices: [],
    };
    for (let key in values) {
      if (key.includes("food_item")) {
        transformedItem.foodItems.push(values[key]);
      } else if (key.includes("calorie")) {
        transformedItem.calories.push(values[key]);
      } else if (key.includes("price")) {
        transformedItem.prices.push(values[key]);
      }
    }
    transformedItem.calories = transformedItem.calories.join(",");
    transformedItem.foodItems = transformedItem.foodItems.join(",");
    transformedItem.prices = transformedItem.prices.join(",");
    axios
      .put(`${baseUrl}/item/${editId}`, transformedItem)
      .then((res) => {
        if (res?.data?.status === "success") {
          setOpenEdit(false);
          openNotificationWithIcon("success", "Success", res.data.message);
          filterReset();
        } else {
          openNotificationWithIcon("error", "Error", res.data.message);
        }
      })
      .catch((err) => {
        console.log(
          "Error occured while fetching used dates as " + err.message
        );
        openNotificationWithIcon("error", "Error", err.message);
      });
  };

  //Open the modal
  const openAddModal = () => {
    axios
      .get(`${baseUrl}/used-dates/${userData.id}`)
      .then((res) => {
        if (res?.data?.status === "success") {
          setdisabledDates(res.data.data);
        } else {
          openNotificationWithIcon("error", "Error", res.data.message);
        }
      })
      .catch((err) => {
        console.log(
          "Error occured while fetching used dates as " + err.message
        );
        openNotificationWithIcon("error", "Error", err.message);
      });
    setOpen(true);
  };

  // Define the disabledDate function
  function disabledDate(current) {
    // Check if the current date is in the array of disabled dates
    return disabledDates.some((date) => date === current.format("YYYY-MM-DD"));
  }
  return (
    <Layout>
      {contextHolder}
      <Header
        style={{
          textAlign: "center",
          color: "#fff",
          height: 64,
          paddingInline: 50,
          lineHeight: "64px",
          backgroundColor: "#1677ff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{ width: "50%", display: "flex", justifyContent: "start" }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "25px",
                fontWeight: "bold",
              }}
            >
              BuRnIt...
            </div>
          </div>
          <div style={{ width: "50%", display: "flex", justifyContent: "end" }}>
            <Button
              type="primary"
              danger
              onClick={() => {
                localStorage.removeItem("userData");
                navigate("/login");
              }}
            >
              Logout
            </Button>{" "}
          </div>
        </div>
      </Header>
      <Content style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "10px",
          }}
        >
          <p
            style={{ fontWeight: "bold", fontSize: "18px" }}
          >{`Welcome ${userData.username} !`}</p>
          <Form
            form={formFilter}
            onFinish={filterSubmit}
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Form.Item name={"search"}>
              <Input placeholder="Search by food item" />
            </Form.Item>
            <Form.Item name={"month"}>
              <Select
                defaultValue={12}
                style={{
                  width: 200,
                }}
                options={[
                  {
                    value: 12,
                    label: "Select a month",
                  },
                  {
                    value: 0,
                    label: "January",
                  },
                  {
                    value: 1,
                    label: "February",
                  },
                  {
                    value: 2,
                    label: "March",
                  },
                  {
                    value: 3,
                    label: "April",
                  },
                  {
                    value: 4,
                    label: "May",
                  },
                  {
                    value: 5,
                    label: "June",
                  },
                  {
                    value: 6,
                    label: "July",
                  },
                  {
                    value: 7,
                    label: "August",
                  },
                  {
                    value: 8,
                    label: "September",
                  },
                  {
                    value: 9,
                    label: "October",
                  },
                  {
                    value: 10,
                    label: "November",
                  },
                  {
                    value: 11,
                    label: "December",
                  },
                ]}
              />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Search</Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={filterReset}>Reset</Button>
            </Form.Item>
            <Form.Item style={{ marginLeft: "5px" }}>
              <Badge
                count={`Spendings: ${spendings}`}
                color={spendings > 999 ? "#f5222d" : "#52c41a"}
              />
            </Form.Item>
          </Form>
          <Button type="primary" onClick={openAddModal}>
            + Add Entry
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={itemData}
          pagination={{
            pageSize: 50,
          }}
          scroll={{ y: 650 }}
        />
        <Modal
          title="Add Entry"
          centered
          open={open}
          width={"1200px"}
          bodyStyle={{ maxHeight: "600px", overflowY: "auto" }}
          footer={[]}
          onCancel={() => setOpen(false)}
        >
          <Form onFinish={onFinish} form={form}>
            <Form.Item
              name={"date"}
              rules={[
                {
                  required: true,
                  message: "Please input date",
                },
              ]}
            >
              <DatePicker
                onChange={() => {}}
                style={{ width: 350 }}
                disabledDate={disabledDate}
              />
            </Form.Item>
            {formElements.map((ele) => ele)}
            <Form.Item style={{ display: "flex", justifyContent: "end" }}>
              <Button
                type="primary"
                onClick={() => {
                  const element = (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Form.Item
                        name={`food_item-${formElements.length}`}
                        rules={[
                          {
                            required: true,
                            message: "Please input food item",
                          },
                        ]}
                      >
                        <Input placeholder="Food Item" style={{ width: 350 }} />
                      </Form.Item>
                      <Form.Item
                        name={`calorie-${formElements.length}`}
                        rules={[
                          {
                            required: true,
                            message: "Please input calorie",
                          },
                          {
                            pattern: /^[0-9]+$/,
                            message: "Field must contain only numbers",
                          },
                        ]}
                      >
                        <Input
                          type="number"
                          placeholder="Calorie"
                          style={{ width: 350 }}
                        />
                      </Form.Item>
                      <Form.Item
                        name={`price-${formElements.length}`}
                        rules={[
                          {
                            required: true,
                            message: "Please input price",
                          },
                          {
                            pattern: /^[0-9]+$/,
                            message: "Field must contain only numbers",
                          },
                        ]}
                      >
                        <Input
                          placeholder="Price"
                          style={{ width: 350 }}
                          type="number"
                        />
                      </Form.Item>
                    </div>
                  );
                  setFormElements([...formElements, element]);
                }}
              >
                <i class="fa-solid fa-plus"></i>
              </Button>
              {formElements.length > 1 && (
                <Button
                  style={{ marginLeft: "10px" }}
                  danger
                  type="primary"
                  onClick={() => {
                    const updatedFormElements = formElements.filter(
                      (_, index) => index !== formElements.length - 1
                    );
                    setFormElements(updatedFormElements);
                  }}
                >
                  <i
                    className="fas fa-times"
                    style={{
                      color: "white",
                    }}
                  ></i>
                </Button>
              )}
            </Form.Item>
            <Form.Item
              style={{ display: "flex", justifyContent: "center", margin: 0 }}
            >
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Edit Entry"
          centered
          open={openEdit}
          width={"1200px"}
          bodyStyle={{ maxHeight: "600px", overflowY: "auto" }}
          footer={[]}
          onCancel={() => setOpenEdit(false)}
        >
          <EditForm fields={editFormData} />
        </Modal>
      </Content>
    </Layout>
  );
};

export default CalorieTable;
