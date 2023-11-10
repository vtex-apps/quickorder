/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import type { WrappedComponentProps } from 'react-intl'
import { injectIntl } from 'react-intl'
import {
  Button,
  Textarea,
  RadioGroup,
} from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'

import { ParseText, GetText } from './utils'

interface CopyPastePadProps {
  onReviewItemsChange: (items: any) => void;
}

const CopyPastePad: React.FC<CopyPastePadProps & WrappedComponentProps> = ({
  onReviewItemsChange,
}) => {
  const [state, setState] = useState<any>({
    reviewState: false,
    showAddToCart: null,
    textAreaValue: '',
    partType: 'manufacturer',
    reviewItems: [],
  })

  const {
    textAreaValue,
    partType,
  } = state

  const onReviewItems = (items: any) => {
    if (items) {
      const show =
        items.filter((item: any) => {
          return item.error
        }).length === 0

      onReviewItemsChange(items)
      setState({
        ...state,
        reviewItems: items,
        reviewState: true,
        showAddToCart: show,
        textAreaValue: GetText(items),
      })
    }

    return true
  }

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

  const setPartType = (newPartType: string) => {
    setState({
      ...state,
      partType: newPartType,
    })
  }

  const setTextareaValue = ($textAreaValue: string) => {
    setState({
      ...state,
      textAreaValue: $textAreaValue,
    })
  }

  const CSS_HANDLES = [
    'buttonValidate',
    'textContainer',
    'copyPasteContainer',
    'reviewBlock',
    'buttonsBlock',
    'textContainerTitle',
    'textContainerDescription',
  ] as const

  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div
      className={`${handles.copyPasteContainer}`}
    >
      <h2>Copy & Paste Pad</h2>
      <p>
        Simply copy and paste part numbers from your file into the field below
        using the following format:
      </p>
      <p>Part number [TAB or COMMA] Quantity</p>

      <RadioGroup
        hideBorder
        label="Select the type of part number:"
        name="partType"
        options={[
          { value: 'manufacturer', label: 'Manufacturer' },
          { value: 'upc', label: 'UPC' },
          { value: 'sku', label: 'SKU' },
        ]}
        value={partType}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setPartType(e.currentTarget.value)
        }
      />
      <section className="mt5">
        <Textarea
          value={textAreaValue}
          placeholder={
            'Examples:' +
            '\n' +
            'T5832-W, 3' +
            '\n' +
            '80401-NW, 3' +
            '\n' +
            '1451-2W, 5' +
            '\n' +
            '88001, 5'
          }
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setTextareaValue(e.target.value)
          }
        />
      </section>
      <section className={`mt2 ${handles.buttonValidate}`}>
        <Button
          variation="primary"
          size="regular"
          disabled={!textAreaValue}
          onClick={() => {
            parseText()
          }}
        >
          Submit
        </Button>
      </section>

    </div>
  )
}

export default injectIntl(CopyPastePad)
