'use client';

import AdminLayout from '../components/AdminLayout';
import { Card, Table, Button, Space, Tag, Descriptions } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import AuthGuard from '@/components/AuthGuard';

// 模拟订单数据
const orderData = [
  {
    key: '1',
    id: 'ORD001',
    orderNumber: '20240115001',
    userName: '张三',
    userPhone: '13800138001',
    products: [
      { name: 'iPhone 15 Pro', quantity: 1, price: 7999 },
      { name: 'AirPods Pro', quantity: 1, price: 1999 }
    ],
    totalAmount: 9998,
    status: 'pending',
    paymentStatus: 'paid',
    shippingAddress: '北京市朝阳区xxx街道xxx号',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00',
  },
  {
    key: '2',
    id: 'ORD002',
    orderNumber: '20240116001',
    userName: '李四',
    userPhone: '13800138002',
    products: [
      { name: 'MacBook Pro', quantity: 1, price: 12999 }
    ],
    totalAmount: 12999,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: '上海市浦东新区xxx路xxx号',
    createTime: '2024-01-16 14:20:00',
    updateTime: '2024-01-17 09:15:00',
  },
  {
    key: '3',
    id: 'ORD003',
    orderNumber: '20240117001',
    userName: '王五',
    userPhone: '13800138003',
    products: [
      { name: 'iPhone 15 Pro', quantity: 2, price: 7999 }
    ],
    totalAmount: 15998,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: '广州市天河区xxx大道xxx号',
    createTime: '2024-01-17 09:15:00',
    updateTime: '2024-01-18 16:30:00',
  },
  {
    key: '4',
    id: 'ORD004',
    orderNumber: '20240118001',
    userName: '赵六',
    userPhone: '13800138004',
    products: [
      { name: 'AirPods Pro', quantity: 3, price: 1999 }
    ],
    totalAmount: 5997,
    status: 'cancelled',
    paymentStatus: 'refunded',
    shippingAddress: '深圳市南山区xxx路xxx号',
    createTime: '2024-01-18 11:45:00',
    updateTime: '2024-01-18 15:20:00',
  },
];

export default function OrdersPage() {
  const handleView = (record: any) => {
    console.log('查看订单详情:', record);
  };

  const handleEdit = (record: any) => {
    console.log('编辑订单:', record);
  };

  const handleDelete = (record: any) => {
    console.log('删除订单:', record);
  };

  const getStatusColor = (status: string) => {
    const statusMap = {
      pending: 'orange',
      confirmed: 'blue',
      shipped: 'cyan',
      delivered: 'green',
      cancelled: 'red',
    };
    return statusMap[status as keyof typeof statusMap] || 'default';
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: '待处理',
      confirmed: '已确认',
      shipped: '已发货',
      delivered: '已送达',
      cancelled: '已取消',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getPaymentStatusColor = (status: string) => {
    const statusMap = {
      pending: 'orange',
      paid: 'green',
      refunded: 'red',
      failed: 'red',
    };
    return statusMap[status as keyof typeof statusMap] || 'default';
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap = {
      pending: '待支付',
      paid: '已支付',
      refunded: '已退款',
      failed: '支付失败',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  return (
    <AdminLayout>
      <div>
        <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>订单管理</h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
          这是订单管理页面，可以查看、编辑和管理系统中的所有订单
        </p>

        <Card>
          <Table 
            dataSource={orderData} 
            pagination={{ pageSize: 10 }}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ margin: 0 }}>
                  <Descriptions title="订单详情" bordered size="small">
                    <Descriptions.Item label="收货地址" span={3}>
                      {record.shippingAddress}
                    </Descriptions.Item>
                    <Descriptions.Item label="商品列表" span={3}>
                      {record.products.map((product: any, index: number) => (
                        <div key={index} style={{ marginBottom: '4px' }}>
                          {product.name} × {product.quantity} = ¥{product.price * product.quantity}
                        </div>
                      ))}
                    </Descriptions.Item>
                    <Descriptions.Item label="创建时间">{record.createTime}</Descriptions.Item>
                    <Descriptions.Item label="更新时间">{record.updateTime}</Descriptions.Item>
                  </Descriptions>
                </div>
              ),
              rowExpandable: (record) => true,
            }}
            columns={[
              {
                title: '订单号',
                dataIndex: 'orderNumber',
                key: 'orderNumber',
              },
              {
                title: '用户',
                dataIndex: 'userName',
                key: 'userName',
              },
              {
                title: '手机号',
                dataIndex: 'userPhone',
                key: 'userPhone',
              },
              {
                title: '订单金额',
                dataIndex: 'totalAmount',
                key: 'totalAmount',
                render: (amount: number) => `¥${amount.toLocaleString()}`,
              },
              {
                title: '订单状态',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => (
                  <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                  </Tag>
                ),
              },
              {
                title: '支付状态',
                dataIndex: 'paymentStatus',
                key: 'paymentStatus',
                render: (status: string) => (
                  <Tag color={getPaymentStatusColor(status)}>
                    {getPaymentStatusText(status)}
                  </Tag>
                ),
              },
              {
                title: '商品数量',
                key: 'productCount',
                render: (_, record) => {
                  const totalQuantity = record.products.reduce((sum: number, product: any) => sum + product.quantity, 0);
                  return totalQuantity;
                },
              },
              {
                title: '操作',
                key: 'action',
                render: (_, record) => (
                  <Space size="middle">
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handleView(record)}
                    >
                      查看
                    </Button>
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(record)}
                      disabled={record.status === 'cancelled' || record.status === 'delivered'}
                    >
                      编辑
                    </Button>
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(record)}
                    >
                      删除
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  );
}