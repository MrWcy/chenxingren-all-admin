'use client'

import React, { useState } from 'react'
import { Form, Input, Button, Card, message, Typography, Space } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp } from '@/lib/auth'

const { Title, Text } = Typography

interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const router = useRouter()

  const onFinish = async (values: RegisterForm) => {
    setLoading(true)
    try {
      const result = await signUp(values.email, values.password)
      
      if (result.success) {
        message.success('注册成功！请检查您的邮箱以验证账户。')
        router.push('/auth/login')
      } else {
        message.error(result.error || '注册失败')
      }
    } catch (error) {
      message.error('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <div className="text-center mb-8">
            <Title level={2} className="text-gray-900">
              用户注册
            </Title>
            <Text type="secondary">
              创建您的新账户
            </Text>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱！' },
                { type: 'email', message: '请输入有效的邮箱地址！' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="请输入邮箱"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码！' },
                { min: 6, message: '密码至少6位字符！' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码！' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致！'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入密码"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full"
              >
                注册
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center">
            <Space direction="vertical" size="small">
              <Text type="secondary">
                已有账户？
                <Link href="/auth/login" className="text-blue-600 hover:text-blue-500">
                  立即登录
                </Link>
              </Text>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  )
}