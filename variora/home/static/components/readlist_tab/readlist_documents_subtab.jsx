import { Avatar, Icon, Button, Row, Col, Popconfirm, Table, message, Card } from 'antd'
import { formatOpenDocumentUrl, getCookie, copyToClipboard } from 'util.js'

import React from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import { fetchExploreDocs } from '../../redux/actions.js'
import TimeAgo from 'react-timeago'

const { Column } = Table


class ReadlistDocumentsSubtabBeforeConnect extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      user: props.user,
      readlist: props.readlist,
      isOwner: props.isOwner,
      readlistSlug: props.readlistSlug,
      suggestedDocuments: []
    }

    this.removeDocument = (document) => {
      var data = new FormData()
      data.append('csrfmiddlewaretoken', getCookie('csrftoken'))
      data.append('document_uuid', document.uuid)
      axios.post(this.state.readlist.remove_document_url, data)
        .then(resp => props.updateData())
    }

    this.onShareClick = () => {
      const url = [location.protocol, '//', location.host, location.pathname].join('')
      copyToClipboard(url)
      message.success('URL copied')
    }
  }

  componentWillReceiveProps(props) {
    if (this.props.mostViewsDocuments == undefined)
      this.props.fetchExploreDocs()
    else
      this.setState({suggestedDocuments: props.mostStarsDocuments})
    this.setState({ ...props })
  }

  render() {
    var documentRemoveAction = ((text, document) => (
      <span>
        <Popconfirm
          title="Are you sure delete this document? It cannot be undone."
          onConfirm={() => this.removeDocument(document)}
          okText="Yes" cancelText="No"
        >
          <a>Remove</a>
        </Popconfirm>
      </span>
    ))

    var documentUploadDate = ((text, document) => (
      <TimeAgo date={document.upload_time} />
    ))

    const columns = [{
      title: '#',
      dataIndex: 'id',
      width: '20%',
      render: (text, record) => this.state.readlist.documents.indexOf(record) + 1
    }, {
      title: 'Title',
      dataIndex: 'title',
      width: '40%',
      render: (text, record) => <a className='document-link' href={formatOpenDocumentUrl(record)}>{text}</a>,
    }].concat(this.state.isOwner ? [{
      title: 'Upload Time',
      key: 'upload_time',
      width: '20%',
      render: (text, document) => documentUploadDate(text, document),
    }, {
      title: 'Action',
      key: 'action',
      width: '20%',
      render: (text, document) => documentRemoveAction(text, document),
    }] : [{
      title: 'Upload Time',
      key: 'upload_time',
      width: '40%',
      render: (text, document) => documentUploadDate(text, document),
    }])
    const readlist = this.state.readlist

    return (
      <div>
        <div className={'card'} style={{ overflow: 'auto', backgroundColor: 'white', marginTop: 18, padding: 18 }}>
          <Row>
            <Col span={16}>
              <div>
                <Avatar src={readlist.owner.portrait_url} style={{ verticalAlign: 'middle', marginRight: 8}} />
                <span style={{ verticalAlign: 'middle' }}>{readlist.owner.nickname} created in <span style={{ color: '#999' }}>3 months ago</span></span>
              </div> 
              <p style={{ fontSize: 28, marginBottom: 18, marginLeft: 8 }}>{readlist.name}</p>
              <div style={{ marginBottom: 18 }}>
                <Button type="primary" ghost icon="link" onClick={this.onShareClick} style={{ marginRight: 18 }}>Share link</Button>
                <Button type="primary" ghost icon="heart-o" style={{ marginRight: 18 }}>Collect 12</Button>
                <Button type="primary" ghost icon="heart" style={{ marginRight: 18 }}>Uncollect 13</Button>
              </div>
              {/* number of collectors */}

              <div style={{height: 9, borderBottom: '1px solid #efefef', margin: '0 0 28px 0', textAlign: 'center'}}>
                <span style={{fontSize: 14, padding: '0 30px', fontWeight: 400, color: 'grey'}}>
                </span>
              </div>
              <Table
                dataSource={this.state.readlist.documents}
                columns={columns}
                pagination={false}
                rowKey={record => record.pk}
              />
            </Col>
            <Col style={{ padding: 18 }} span={8}>
              <p style={{ fontSize: 16, marginBottom: 18, marginLeft: 8 }}>Description: </p>
              <p style={{ whiteSpace: 'pre-wrap', marginBottom: 18, marginLeft: 8 }}>{readlist.description}</p>
              {this.props.mostViewsDocuments != undefined ?
                (
                  <div style={{ marginTop: 38 }}>
                    <p style={{ fontSize: 16, marginBottom: 18, marginLeft: 8 }}>You might be interested: </p>
                    <Row type='flex' justify='start'>
                      {this.state.suggestedDocuments.map((document) => (
                        <Col>
                          <Card style={{ width: 80, margin: 18 }} className='custome-card-cover' bodyStyle={{ padding: 0 }}>
                            <div className='custom-image'>
                              <a target='_blank' href={document.open_url} >
                                <img width='100%' height='108' src={document.image} />
                              </a>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                ) : null
              }
            </Col>
          </Row>
        </div>
      </div>
    )
  }
}

const mapStoreToProps = (store, ownProps) => {
  return {
    ...ownProps,
    ...store
  }
}
const ReadlistDocumentsSubtab = connect(mapStoreToProps, {fetchExploreDocs})(ReadlistDocumentsSubtabBeforeConnect)
export { ReadlistDocumentsSubtab }


