/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react'
import { AutocompleteInput } from 'vtex.styleguide'
import PropTypes from 'prop-types'

import { WrappedComponentProps, injectIntl, defineMessages } from 'react-intl'

import autocomplete from '../queries/autocomplete.gql'

import { uniq } from 'lodash'
import { useApolloClient } from 'react-apollo'

const messages = defineMessages({
  placeholder: {
    id: 'store/quickorder.autocomplete.placeholder',
    defaultMessage: '',
    label: '',
  },
})

const getImageSrc = (img: string) => {
  const src: any = img ? img.match(/src=["']([^"']+)/) : []
  return !!src && src.length ? src[1] : ''
}

const CustomOption = (props: any) => {
  const { roundedBottom, searchTerm, value, selected, onClick } = props
  const [highlightOption, setHighlightOption] = useState(false)

  const renderOptionHighlightedText = () => {
    const highlightableText = typeof value === 'string' ? value : value.label
    const index = highlightableText
      .toLowerCase()
      .indexOf(searchTerm.toLowerCase())
    if (index === -1) {
      return highlightableText
    }
    const prefix = highlightableText.substring(0, index)
    const match = highlightableText.substr(index, searchTerm.length)
    const suffix = highlightableText.substring(index + match.length)
    return (
      <span className="truncate">
        <span className="fw7">{prefix}</span>
        {match}
        <span className="fw7">{suffix}</span>
      </span>
    )
  }

  const buttonClasses = `bn w-100 tl pointer pa4 f6 ${
    roundedBottom ? 'br2 br--bottom' : ''
  } ${highlightOption || selected ? 'bg-muted-5' : 'bg-base'}`

  const thumb = value.thumb ? value.thumb : ''

  return (
    <button
      className={buttonClasses}
      onFocus={() => setHighlightOption(true)}
      onMouseEnter={() => setHighlightOption(true)}
      onMouseLeave={() => setHighlightOption(false)}
      onClick={onClick}
    >
      <div className="flex items-center">
        <span className="mr3 c-muted-2 flex pt1">
          {thumb && <img src={thumb} alt="" />}
        </span>
        <span className="pr2">{renderOptionHighlightedText()}</span>
        {typeof value !== 'string' && (
          <div className="t-mini c-muted-1">{value.caption}</div>
        )}
      </div>
    </button>
  )
}
interface QuickOrderAutocompleteInt {
  onSelect: any
}
const QuickOrderAutocomplete: StorefrontFunctionComponent<WrappedComponentProps &
  QuickOrderAutocompleteInt> = ({ onSelect, intl }: any) => {
  const client = useApolloClient()
  const [optionsResult, setOptions] = useState([])
  const [term, setTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastSearched, setLastSearched] = useState([])
  const timeoutRef: any = useRef(null)

  const handleSearch = async ({ value }: any) => {
    if (value.length > 1) {
      const { data } = await client.query({
        query: autocomplete,
        variables: { inputValue: value },
      })
      setOptions(
        !!data && !!data.autocomplete && !!data.autocomplete.itemsReturned
          ? data.autocomplete.itemsReturned
          : []
      )
    }
  }

  const options = {
    onSelect: (...args: any) => {
      onSelect(args)
    },
    loading,
    value: !term.length
      ? []
      : optionsResult
          .filter((item: any) => {
            return !!item.thumb
          })
          .map((item: any) => {
            return {
              value: item.productId,
              label: item.name,
              slug: item.slug,
              thumb: getImageSrc(item.thumb),
            }
          }),
    lastSearched: {
      value: lastSearched,
      label: 'Last searched products',
      onChange: (option: never) =>
        option && setLastSearched(uniq([...lastSearched, option])),
    },
    // --- This is what makes the custom option work!
    // eslint-disable-next-line react/display-name
    renderOption: (props: any) => <CustomOption {...props} />,
  }

  const input = {
    onChange: (term: any) => {
      if (term) {
        setLoading(true)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          setLoading(false)
          setTerm(term)
          handleSearch({ value: term })
          timeoutRef.current = null
        }, 1000)
      } else {
        setTerm(term)
      }
    },
    onSearch: () => () => {},
    onClear: () => setTerm(''),
    placeholder: intl.formatMessage(messages.placeholder),
    value: term,
  }
  return <AutocompleteInput input={input} options={options} />
}

QuickOrderAutocomplete.propTypes = {
  onSelect: PropTypes.func,
}
export default injectIntl(QuickOrderAutocomplete)
