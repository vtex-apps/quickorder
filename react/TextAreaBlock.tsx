import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { Button, Textarea } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'

import { ParseText } from './utils'

const TextAreaBlock: StorefrontFunctionComponent<TextAreaBlockInterface> = ({
  value,
  text,
  description,
  onReviewItems,
}: any) => {
  const [state, setState] = useState<any>({
    textAreaValue: value || '',
    reviewItems: [],
  })

  const { textAreaValue } = state

  const parseText = () => {
    const items: any = ParseText(textAreaValue) || []
    const error = !!items.filter((item: any) => {
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
    <div>
      <div className="w-third-l w-100-ns fl-l">
        <div className="flex-grow-1">
          <h2 className="t-heading-3 mb3 ml5 ml3-ns mt4">{text}</h2>
          <div className="t-body lh-copy c-muted-1 mb7 ml3 false">
            {description}
          </div>
        </div>
      </div>
      <div className="w-two-thirds-l w-100-ns fr-l">
        <div className="w-100 mb5">
          <div className="bg-base t-body c-on-base pa7 br3 b--muted-4 ba">
            <Textarea
              value={textAreaValue}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setTextareaValue(e.target.value)
              }
            />
            <div className={`mt2 flex justify-end ${handles.buttonValidate}`}>
              <Button
                variation="secondary"
                size="regular"
                onClick={() => {
                  parseText()
                }}
              >
                <FormattedMessage id="store/quickorder.validate" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TextAreaBlockInterface {
  value: string
  onReviewItems: any
  onRefidLoading: any
  text: string
  description: string
}

export default TextAreaBlock
