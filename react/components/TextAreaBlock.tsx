import React, { useState } from 'react'
import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl'
import { PageBlock, Button, Textarea } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import { ParseText } from '../utils'

const TextAreaBlock: StorefrontFunctionComponent<WrappedComponentProps &
  TextAreaBlockInterface> = ({ value, onReviewItems, intl }: any) => {
  const [state, setState] = useState<any>({
    textAreaValue: value || '',
    reviewItems: [],
  })

  const { textAreaValue } = state

  const parseText = () => {
    const items: any = ParseText(textAreaValue) || []
    let error = !!items.filter((item: any) => {
      return item.error !== null
    }).length

    setState({
      ...state,
      reviewItems: items,
      reviewState: true,
      hasError: error,
      toValidate: true,
    })
    onReviewItems(items)
  }

  const setTextareaValue = (textAreaValue: string) => {
    setState({
      ...state,
      textAreaValue,
    })
  }

  const CSS_HANDLES = ['buttonValidate'] as const
  const handles = useCssHandles(CSS_HANDLES)

  return (
    <PageBlock
      variation="annotated"
      title={intl.formatMessage({ id: 'quickorder.textarea.label' })}
      subtitle={intl.formatMessage({ id: 'quickorder.textarea.helper' })}
    >
      <Textarea
        value={textAreaValue}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setTextareaValue(e.target.value)
        }
      ></Textarea>
      <div className={`mb4 flex justify-end ${handles.buttonValidate}`}>
        <Button
          variation="secondary"
          size="regular"
          onClick={() => {
            parseText()
          }}
        >
          <FormattedMessage id="quickorder.validate" />
        </Button>
      </div>
    </PageBlock>
  )
}

interface TextAreaBlockInterface {
  value: string
  onReviewItems: any
  onRefidLoading: any
}

export default injectIntl(TextAreaBlock)
