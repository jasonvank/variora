import { Form, Modal, Input } from 'antd'
import React from 'react'
import { FormattedMessage } from 'react-intl'
import 'regenerator-runtime/runtime'

const FormItem = Form.Item
const { TextArea } = Input

const CreateReadlistForm = Form.create({
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields)
  },
  mapPropsToFields(props) {
    return {
      readlistName: Form.createFormField({
        ...props.readlistName,
        value: props.readlistName.value,
      }),
      readlistDesc: Form.createFormField({
        ...props.readlistDesc,
        value: props.readlistDesc.value,
      }),
    }
  },
})(props => {
  const { getFieldDecorator } = props.form
  return (
    <Form>
      <FormItem
        label={
          <FormattedMessage
            id='app.readlists.name_readlist'
            defaultMessage='Name of the readlist'
          />
        }
      >
        {getFieldDecorator('readlistName', {
          rules: [
            {
              required: true,
              message: (
                <FormattedMessage
                  id='app.readlists.message.empty_name'
                  defaultMessage='The name of the readlist cannot be empty!'
                />
              ),
            },
          ],
        })(<Input />)}
      </FormItem>
      <FormItem
        label={<FormattedMessage id='app.readlists.description' defaultMessage='Description' />}
      >
        {getFieldDecorator('readlistDesc')(<TextArea />)}
      </FormItem>
    </Form>
  )
})

const CreateCoterieForm = Form.create({
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields)
  },
  mapPropsToFields(props) {
    return {
      coterieName: Form.createFormField({
        ...props.coterieName,
        value: props.coterieName.value,
      }),
    }
  },
})(props => {
  const { getFieldDecorator } = props.form
  return (
    <Form layout='inline'>
      <FormItem label={<FormattedMessage id='app.group.name' defaultMessage='group name' />}>
        {getFieldDecorator('coterieName', {
          rules: [
            {
              required: true,
              message: (
                <FormattedMessage
                  id='app.group.message.empty_name'
                  defaultMessage='Group name cannot be empty!'
                />
              ),
            },
          ],
        })(<Input />)}
      </FormItem>
    </Form>
  )
})

class CreateFormModal extends React.Component {
  render() {
    return (
      <div>
        <Modal
          title={
            <FormattedMessage
              id='app.readlists.message.create'
              defaultMessage='create a new readlist'
            />
          }
          wrapClassName='vertical-center-modal'
          visible={ this.props.createReadlistModelVisible }
          onOk={ this.props.submitCreateReadlistForm }
          onCancel={ () => this.props.setCreateReadlistModelVisible(false) }
        >
          <CreateReadlistForm
            { ...this.props.fields }
            onChange={ this.props.handleCreateReadlistFromChange }
          />
        </Modal>
      
        <Modal
          title={
            <FormattedMessage id='app.group.create'
                              defaultMessage='create a new group'/>
          }
          wrapClassName='vertical-center-modal'
          visible={ this.props.createGroupModelVisible }
          onOk={ this.props.submitCreateCoterieForm }
          onCancel={ () => this.props.setCreateCoterieModelVisible(false) }
        >
          <CreateCoterieForm
            { ...this.props.fields }
            onChange={ this.props.handleCreateCoterieFromChange }
          />
        </Modal>
      </div>
  
    )
  }
}

function getCoterieUUID() {
  if (window.location.pathname.includes('/groups/')) return window.location.pathname.split('/')[2]
  return undefined
}





export { CreateReadlistForm, CreateCoterieForm, CreateFormModal, getCoterieUUID }
