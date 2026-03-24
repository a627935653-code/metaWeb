import React, { useMemo, useState, type ReactNode, type JSX } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Grid,
  Input,
  Row,
  Select,
  Slider,
  Space,
} from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { Show } from "./Show";
import { useNavigate } from "react-router-dom";

const { useBreakpoint } = Grid;
const { RangePicker } = DatePicker;

export interface FieldsType {
  name: string;
  label: React.ReactNode;
  type:
    | "input"
    | "select"
    | "multiple"
    | "datepicker"
    | "slider"
    | "input-range"
    | "select-input"
    | "datepicker-custom";
  selectList?: {
    value?: string | number;
    label?: string | number | ReactNode | JSX.Element;
  }[];
  sliderRang?: number[];
}

interface FilterGroupParamsType {
  fields: FieldsType[];
  resetPageGroup: () => void;
  updateFilterParams: (values: any) => void;
  defaultData?: any;
}

export default function FilterGroup({
  fields,
  resetPageGroup,
  updateFilterParams,
  defaultData,
}: FilterGroupParamsType) {
  const [form] = Form.useForm();
  const [expand, setExpand] = useState(false);
  const screens = useBreakpoint();
  const navigate = useNavigate();

  // 响应式列宽
  const getColSpan = () => {
    if (screens.xl) return 4;
    if (screens.lg) return 6;
    if (screens.md) return 8;
    return 24;
  };
  const colSpan = getColSpan();

  const getSpanByType = (type: string) => colSpan;

  // 折叠字段计算
  const collapsedFields = useMemo(() => {
    const result: FieldsType[] = [];
    let totalSpan = 0;
    for (const field of fields) {
      const span = getSpanByType(field.type);
      if (totalSpan + span > 24 - colSpan) break; // 为按钮保留一格
      totalSpan += span;
      result.push(field);
    }
    return result;
  }, [fields, colSpan]);

  const visibleFields = expand ? fields : collapsedFields;

  // ⚡ 初始值仅用于第一次显示
  const initialFormValues = useMemo(() => {
    return defaultData ? { ...defaultData } : {};
  }, [defaultData]);

  // 查询
  const handleFinish = (values: any) => {
    const filteredValues: any = {};
    Object.entries(values).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        const field = fields.find((f) => f.name === key);
        if (field?.type === "datepicker-custom" && Array.isArray(value)) {
          filteredValues["start" + key] = +value[0] / 1000;
          filteredValues["end" + key] = +value[1] / 1000;
        } else {
          filteredValues[key] = value;
        }
      }
    });

    resetPageGroup();
    updateFilterParams(filteredValues);
  };

  // 重置
  const handleReset = () => {
    form.setFieldsValue({}); // 清空表单
    updateFilterParams({}); // 清空筛选条件
    navigate(location.pathname, { replace: true }); // 清空路由参数
    form.resetFields();
  };

  // 渲染字段
  const renderFields = visibleFields.map((field) => {
    const span = getSpanByType(field.type);
    return (
      <Col key={field.name} span={span}>
        <Show
          when={field?.type !== "input-range"}
          fallback={
            <div className="w-full flex justify-start items-center">
              <Form.Item
                name={"start" + field.name}
                label={field.label + "区间"}
                style={{ marginBottom: "10px" }}
              >
                {/* 👇 像这样，给一个固定宽度 */}
                <Input placeholder={`开始${field?.label}`} />
              </Form.Item>
              <div className="w-5 mx-2 h-0.5 bg-gray-400"></div>
              <Form.Item
                name={"end" + field.name}
                label=" "
                style={{ marginBottom: "12px" }}
              >
                {/* 👇 像这样，给一个固定宽度 */}
                <Input placeholder={`结束${field?.label}`} />
              </Form.Item>
            </div>
          }
        >
          <Form.Item
            name={field.name}
            label={field.label}
            style={{ marginBottom: "12px" }}
          >
            {field.type === "slider" ? (
              <Slider
                range
                defaultValue={field?.sliderRang}
                min={field?.sliderRang?.[0]}
                max={field?.sliderRang?.[1]}
                step={10}
              />
            ) : field.type === "select" ||
              field.type === "select-input" ||
              field.type === "multiple" ? (
              <Select
                showSearch={field.type === "select-input"}
                optionFilterProp="label"
                placeholder={`请选择 ${field?.label}`}
                options={field?.selectList}
                mode={field.type === "multiple" ? "multiple" : undefined}
                allowClear
              />
            ) : field.type === "datepicker" ||
              field.type === "datepicker-custom" ? (
              <RangePicker
                placeholder={["开始时间", "结束时间"]}
                showTime
                format="YYYY-MM-DD HH:mm:ss"
              />
            ) : (
              <Input placeholder={`请输入${field.label}`} />
            )}
          </Form.Item>
        </Show>
      </Col>
    );
  });

  const renderButtons = (
    <Form.Item
      label={expand ? null : " "}
      colon={false}
      style={{ marginBottom: 0 }}
    >
      <Space>
        <Button type="primary" htmlType="submit">
          查询
        </Button>
        <Button onClick={handleReset}>重置</Button>
        <Show when={!!expand || fields.length !== visibleFields?.length}>
          <Button type="link" onClick={() => setExpand(!expand)}>
            {expand ? (
              <>
                收起 <UpOutlined />
              </>
            ) : (
              <>
                展开 <DownOutlined />
              </>
            )}
          </Button>
        </Show>
      </Space>
    </Form.Item>
  );

  return (
    <Card
      title="条件筛选"
      style={{
        paddingBottom: 0,
      }}
    >
      <Form
        form={form}
        onFinish={handleFinish}
        layout="vertical"
        initialValues={initialFormValues} // 仅第一次显示
      >
        <Row gutter={8}>
          {renderFields}
          {!expand &&
            (() => {
              const usedSpan = collapsedFields.reduce(
                (acc, cur) => acc + getSpanByType(cur.type),
                0
              );
              const remainingSpan = 24 - usedSpan;
              return (
                <Col
                  span={colSpan}
                  offset={remainingSpan - colSpan}
                  style={{ textAlign: "right" }}
                >
                  {renderButtons}
                </Col>
              );
            })()}
        </Row>
        {expand && (
          <Row gutter={8}>
            <Col
              span={colSpan}
              offset={24 - colSpan}
              style={{ textAlign: "right" }}
            >
              {renderButtons}
            </Col>
          </Row>
        )}
      </Form>
    </Card>
  );
}
