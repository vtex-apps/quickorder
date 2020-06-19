/* eslint-disable no-console */
import React, { useState } from 'react'
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl'
import { Button, Dropzone } from 'vtex.styleguide'
import { useCssHandles } from 'vtex.css-handles'
import XLSX from 'xlsx'

import { ParseText } from './utils'

const UploadBlock: StorefrontFunctionComponent<UploadBlockInterface &
  WrappedComponentProps> = ({
  onReviewItems,
  text,
  description,
  downloadText,
}: any) => {
  let productsArray: any = []
  const [state, setState] = useState<any>({
    reviewItems: [],
    hasError: false,
  })

  const { reviewItems, hasError } = state

  console.log('reviewItems', reviewItems)
  console.log('hasError', hasError)

  const download = () => {
    const finalHeaders = ['SKU', 'Quantity']
    const data = [
      { SKU: 'AB120', Quantity: 2 },
      { SKU: 'AB121', Quantity: 3 },
      { SKU: 'AB122', Quantity: 5 },
      { SKU: 'AB123', Quantity: 10 },
      { SKU: 'AB124', Quantity: 1 },
      { SKU: 'AB125', Quantity: 20 },
    ]

    const ws = XLSX.utils.json_to_sheet(data, { header: finalHeaders })
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'SheetJS')
    const exportFileName = `model-quickorder.xls`
    XLSX.writeFile(wb, exportFileName)
  }

  const parseText = () => {
    let textAreaValue = ''

    productsArray.forEach(element => {
      textAreaValue += `${element[0]},${element[1]}\n`
    })

    const items: any = ParseText(textAreaValue) || []
    const error = !!items.filter((item: any) => {
      return item.error !== null
    }).length

    setState({
      ...state,
      reviewItems: items,
      hasError: error,
    })
    onReviewItems(items)
  }

  const processWb = (() => {
    const toJson = function toJson(workbook: any) {
      const result: any = {}
      workbook.SheetNames.forEach((sheetName: any) => {
        const roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: 1,
        })
        if (roa.length) result[sheetName] = roa
      })
      return result
    }
    return (wb: any) => {
      let output: any = null
      output = toJson(wb)
      return output
    }
  })()

  const doFile = (files: any) => {
    const f = files[0]
    const reader: any = new FileReader()
    reader.onload = (e: any) => {
      let data = e.target.result
      data = new Uint8Array(data)
      const result = processWb(XLSX.read(data, { type: 'array' }))
      const sheetName = Object.getOwnPropertyNames(result)[0]
      result[sheetName].splice(0, 1)
      productsArray = result[sheetName]
      productsArray = productsArray.filter(item => item.length)
      productsArray.forEach(p => {
        p[0] = (p[0] || '').toString().trim()
        p[1] = (p[1] || '').toString().trim()
      })
      console.log('productsArray', productsArray)
      // onReviewItems(items)
    }
    reader.onerror = () => {
      // error
    }
    reader.readAsArrayBuffer(f)
  }

  // const setTextareaValue = (textAreaValue: string) => {
  //   setState({
  //     ...state,
  //     textAreaValue,
  //   })
  // }

  const handleFile = (files: any) => {
    // .setState({ result: files })
    doFile(files)
    console.log(files)
  }

  const handleReset = (files: any) => {
    if (files) {
      console.log(files)
    }
  }

  const CSS_HANDLES = [
    'buttonValidate',
    'dropzoneContainer',
    'dropzoneText',
    'dropzoneLink',
    'downloadLink',
  ] as const
  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div>
      <div className="w-third-l w-100-ns fl-l">
        <div className="flex-grow-1">
          <h2 className="t-heading-3 mb3 ml5 ml3-ns mt4">{text}</h2>
          <div className="t-body lh-copy c-muted-1 mb7 ml3 false">
            {description}{' '}
            {downloadText && (
              <button
                className={`${handles.downloadLink} pointer c-link hover-c-link active-c-link no-underline underline-hover bn bg-transparent`}
                onClick={() => {
                  download()
                }}
              >
                {downloadText}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="w-two-thirds-l w-100-ns fr-l">
        <div className="w-100 mb5">
          <div
            className={`bg-base t-body c-on-base pa7 br3 b--muted-4 ba ${handles.dropzoneContainer}`}
          >
            <Dropzone onDropAccepted={handleFile} onFileReset={handleReset}>
              <div className="pt7">
                <div>
                  <span className={`f4 ${handles.dropzoneText}`}>
                    <FormattedMessage id="store/quickorder.upload.drop" />{' '}
                  </span>
                  <span
                    className={`f4 ${handles.dropzoneLink} c-link"`}
                    style={{ cursor: 'pointer' }}
                  >
                    <FormattedMessage id="store/quickorder.upload.choose" />
                  </span>
                </div>
              </div>
            </Dropzone>
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

interface UploadBlockInterface {
  onReviewItems: any
  onRefidLoading: any
  text: string
  description: string
  downloadText?: string
}

export default injectIntl(UploadBlock)
