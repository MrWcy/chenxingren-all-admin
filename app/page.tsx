import AdminLayout from './components/AdminLayout';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, ShoppingOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';

export default function Home() {
  return (
    <AdminLayout>
      <div>
        <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>概览页面</h1>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
          这是概览页面，显示系统的整体数据统计
        </p>
        
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总用户数"
                value={1128}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="商品总数"
                value={256}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="订单总数"
                value={892}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="总销售额"
                value={125680}
                prefix={<DollarOutlined />}
                suffix="元"
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
}
