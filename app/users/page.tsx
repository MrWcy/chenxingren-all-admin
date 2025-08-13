'use client';

import AdminLayout from '../components/AdminLayout';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, DatePicker, message, Drawer, Divider } from 'antd';
import { EditOutlined, HomeOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

interface User {
  id: number;
  openid: string;
  unionid?: string;
  nickname?: string;
  avatarUrl?: string;
  gender?: number;
  phone?: string;
  email?: string;
  birthday?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface UserAddress {
  id: number;
  userId: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  postalCode?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addressDrawerVisible, setAddressDrawerVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [addressForm] = Form.useForm();

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      } else {
        message.error(result.message || '获取用户列表失败');
      }
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取用户地址
  const fetchUserAddresses = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}/addresses`);
      const result = await response.json();
      if (result.success) {
        setUserAddresses(result.data);
      } else {
        message.error(result.message || '获取用户地址失败');
      }
    } catch (error) {
      message.error('获取用户地址失败');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 编辑用户
  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    form.setFieldsValue({
      ...user,
      birthday: user.birthday ? dayjs(user.birthday) : null,
    });
    setEditModalVisible(true);
  };

  // 保存用户信息
  const handleSaveUser = async () => {
    try {
      const values = await form.validateFields();
      const updateData = {
        ...values,
        birthday: values.birthday ? values.birthday.format('YYYY-MM-DD') : null,
        id: currentUser?.id,
      };

      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (result.success) {
        message.success('用户信息更新成功');
        setEditModalVisible(false);
        fetchUsers();
      } else {
        message.error(result.message || '更新用户信息失败');
      }
    } catch (error) {
      message.error('更新用户信息失败');
    }
  };

  // 管理用户地址
  const handleManageAddresses = async (user: User) => {
    setCurrentUser(user);
    await fetchUserAddresses(user.id);
    setAddressDrawerVisible(true);
  };

  // 编辑地址
  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    addressForm.setFieldsValue(address);
    setAddressModalVisible(true);
  };

  // 保存地址
  const handleSaveAddress = async () => {
    try {
      const values = await addressForm.validateFields();
      const updateData = {
        ...values,
        addressId: editingAddress?.id,
      };

      const response = await fetch(`/api/users/${currentUser?.id}/addresses`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (result.success) {
        message.success('地址更新成功');
        setAddressModalVisible(false);
        if (currentUser) {
          await fetchUserAddresses(currentUser.id);
        }
      } else {
        message.error(result.message || '更新地址失败');
      }
    } catch (error) {
      message.error('更新地址失败');
    }
  };

  return (
    <AdminLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', margin: 0 }}>用户管理</h1>
        </div>
        
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
          这是用户管理页面，可以查看、编辑用户信息和管理用户地址
        </p>

        <Card>
          <Table 
            dataSource={users}
            loading={loading}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
                width: 80,
              },
              {
                title: '昵称',
                dataIndex: 'nickname',
                key: 'nickname',
                render: (nickname: string) => nickname || '-',
              },
              {
                title: '邮箱',
                dataIndex: 'email',
                key: 'email',
                render: (email: string) => email || '-',
              },
              {
                title: '手机号',
                dataIndex: 'phone',
                key: 'phone',
                render: (phone: string) => phone || '-',
              },
              {
                title: '性别',
                dataIndex: 'gender',
                key: 'gender',
                render: (gender: number) => {
                  const genderMap = { 0: '未知', 1: '男', 2: '女' };
                  return genderMap[gender as keyof typeof genderMap] || '未知';
                },
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: (status: number) => (
                  <Tag color={status === 1 ? 'green' : 'red'}>
                    {status === 1 ? '正常' : '禁用'}
                  </Tag>
                ),
              },
              {
                title: '创建时间',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
              },
              {
                title: '操作',
                key: 'action',
                width: 200,
                render: (_, record) => (
                  <Space size="middle">
                    <Button
                      type="link"
                      icon={<UserOutlined />}
                      onClick={() => handleEditUser(record)}
                    >
                      编辑用户
                    </Button>
                    <Button
                      type="link"
                      icon={<HomeOutlined />}
                      onClick={() => handleManageAddresses(record)}
                    >
                      管理地址
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>

        {/* 用户编辑模态框 */}
        <Modal
          title="编辑用户信息"
          open={editModalVisible}
          onOk={handleSaveUser}
          onCancel={() => setEditModalVisible(false)}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ status: 1, gender: 0 }}
          >
            <Form.Item
              label="昵称"
              name="nickname"
            >
              <Input placeholder="请输入昵称" />
            </Form.Item>
            
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            
            <Form.Item
              label="手机号"
              name="phone"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
            
            <Form.Item
              label="性别"
              name="gender"
            >
              <Select>
                <Select.Option value={0}>未知</Select.Option>
                <Select.Option value={1}>男</Select.Option>
                <Select.Option value={2}>女</Select.Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              label="生日"
              name="birthday"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              label="状态"
              name="status"
            >
              <Select>
                <Select.Option value={1}>正常</Select.Option>
                <Select.Option value={0}>禁用</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* 地址管理抽屉 */}
        <Drawer
          title={`${currentUser?.nickname || '用户'}的地址管理`}
          placement="right"
          width={800}
          open={addressDrawerVisible}
          onClose={() => setAddressDrawerVisible(false)}
        >
          <Table
            dataSource={userAddresses}
            rowKey="id"
            pagination={false}
            columns={[
              {
                title: '收货人',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: '手机号',
                dataIndex: 'phone',
                key: 'phone',
              },
              {
                title: '地址',
                key: 'address',
                render: (_, record) => 
                  `${record.province}${record.city}${record.district}${record.detailAddress}`,
              },
              {
                title: '默认地址',
                dataIndex: 'isDefault',
                key: 'isDefault',
                render: (isDefault: boolean) => (
                  <Tag color={isDefault ? 'blue' : 'default'}>
                    {isDefault ? '是' : '否'}
                  </Tag>
                ),
              },
              {
                title: '操作',
                key: 'action',
                render: (_, record) => (
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => handleEditAddress(record)}
                  >
                    编辑
                  </Button>
                ),
              },
            ]}
          />
        </Drawer>

        {/* 地址编辑模态框 */}
        <Modal
          title="编辑地址"
          open={addressModalVisible}
          onOk={handleSaveAddress}
          onCancel={() => setAddressModalVisible(false)}
          width={600}
        >
          <Form
            form={addressForm}
            layout="vertical"
          >
            <Form.Item
              label="收货人姓名"
              name="name"
              rules={[{ required: true, message: '请输入收货人姓名' }]}
            >
              <Input placeholder="请输入收货人姓名" />
            </Form.Item>
            
            <Form.Item
              label="手机号"
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
            
            <Form.Item
              label="省份"
              name="province"
              rules={[{ required: true, message: '请输入省份' }]}
            >
              <Input placeholder="请输入省份" />
            </Form.Item>
            
            <Form.Item
              label="城市"
              name="city"
              rules={[{ required: true, message: '请输入城市' }]}
            >
              <Input placeholder="请输入城市" />
            </Form.Item>
            
            <Form.Item
              label="区县"
              name="district"
              rules={[{ required: true, message: '请输入区县' }]}
            >
              <Input placeholder="请输入区县" />
            </Form.Item>
            
            <Form.Item
              label="详细地址"
              name="detailAddress"
              rules={[{ required: true, message: '请输入详细地址' }]}
            >
              <Input.TextArea rows={3} placeholder="请输入详细地址" />
            </Form.Item>
            
            <Form.Item
              label="邮政编码"
              name="postalCode"
            >
              <Input placeholder="请输入邮政编码" />
            </Form.Item>
            
            <Form.Item
              label="设为默认地址"
              name="isDefault"
              valuePropName="checked"
            >
              <Select>
                <Select.Option value={true}>是</Select.Option>
                <Select.Option value={false}>否</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
}