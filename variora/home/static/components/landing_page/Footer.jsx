
import React from 'react'
import { Row, Col } from 'antd'

function Footer() {
  return (
    <footer id='footer' className='dark'>
      {/* <div className='footer-wrap'>
        <Row>
          <Col lg={6} sm={24} xs={24}>
            <div className='footer-center'>
              <h2>Variora</h2>
              <div>
                <a target='_blank ' href='https://github.com/R-o-y/variora'>
                  GitHub
                </a>
              </div>
              <div>
                <a href='http://variora.ml'>Variora.ml</a>
              </div>
            </div>
          </Col>
          <Col lg={6} sm={24} xs={24}>
            <div className='footer-center'>
              <h2>资源链接</h2>
              <div>
                <a target='_blank' rel='noopener noreferrer' href='https://github.com/dvajs/dva'>dva</a> - 应用框架
              </div>
              <div>
                <a target='_blank' rel='noopener noreferrer' href='https://github.com/dvajs/dva-cli'>dva-cli</a> -
                开发工具
              </div>
            </div>
          </Col>
          <Col lg={6} sm={24} xs={24}>
            <div className='footer-center'>
              <h2>社区</h2>
              <div>
                <a href='/changelog'>
                  更新记录
                </a>
              </div>
              <div>
                <a target='_blank' rel='noopener noreferrer' href='https://github.com/ant-design/ant-design/wiki/FAQ'>
                  常见问题
                </a>
              </div>
              <div>
                <a target='_blank' rel='noopener noreferrer' href='https://gitter.im/ant-design/ant-design'>
                  在线讨论 (中文)
                </a>
              </div>
              <div>
                <a target='_blank' rel='noopener noreferrer' href='https://gitter.im/ant-design/ant-design-english'>
                  在线讨论 (English)
                </a>
              </div>
              <div>
                <a target='_blank' rel='noopener noreferrer' href='http://new-issue.ant.design/'>
                  报告 Bug
                </a>
              </div>
              <div>
                <a target='_blank' rel='noopener noreferrer' href='https://github.com/ant-design/ant-design/issues'>
                  讨论列表
                </a>
              </div>
            </div>
          </Col>
          <Col lg={6} sm={24} xs={24}>
            <div className='footer-center'>
              <h2>
                <img className='title-icon' src='https://gw.alipayobjects.com/zos/rmsportal/nBVXkrFdWHxbZlmMbsaH.svg' alt='' />
                更多产品
              </h2>
              <div>
                <a target='_blank' rel='noopener noreferrer' href='https://antv.alipay.com/'>AntV</a>
                <span> - </span>
                数据可视化
              </div>
            </div>
          </Col>
        </Row>
      </div> */}
      <Row className='bottom-bar' style={{ textAlign: 'center' }}>
          © 2018 Variora. Reach us via <a style={{ color: '#37b' }} href='mailto:variora@outlook.com'>variora@outlook.com</a>
      </Row>
    </footer>
  )
}

export default Footer
