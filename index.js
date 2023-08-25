import React, { useEffect, useState } from 'react'
import { StyleSheet, Dimensions, View, TextInput, Text, TouchableOpacity, Platform } from 'react-native'
import CountryPicker, { DARK_THEME, DEFAULT_THEME } from 'react-native-country-picker-modal'

import getAllCountries from './utils/getAllCountries'
import getCountriesByName from './utils/getCountriesByName'
import getCountriesByCallingCode from './utils/getCountriesByCallingCode'
import getCountryByCca2 from './utils/getCountryByCca2'
import getCountryByPhoneNumber from './utils/getCountryByPhoneNumber'
import phoneMask from './utils/inputMask'
import { WithLocalSvg } from 'react-native-svg'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
function PhoneInput({
  placeholder,
  placeholderTextColor,
  selectionColor,
  containerStyle,
  flagContainerStyle,
  inputStyle,
  withDarkTheme,
  disabled,
  defaultValue,
  onChangePhoneNumber,
  selectedCountry,
  onChangeSelectedCountry,
  ...rest
}) {
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width)
  const [defaultCca2, setDefaultCca2] = useState('')
  const [shownCca2, setHiddenCca2] = useState(true)

  function onSelect(country) {
    console.log(country)
   
    setHiddenCca2(true)
    onChangePhoneNumber('')
    if (onChangeSelectedCountry) {
      onChangeSelectedCountry({
        name: country.name,
        cca2: country.cca2,
        flag: country.flag,
        callingCode: `+${country.callingCode[0]}`,
      })
    }
  }

  function onChangeText(phoneNumber, callingCode) {
   
    const res = phoneMask(
      phoneNumber,
      callingCode ? callingCode : selectedCountry?.callingCode,
      selectedCountry?.cca2,
    )

    onChangePhoneNumber(res)
  }

  useEffect(() => {
    onChangePhoneNumber('')
    if (defaultValue) {
      const matchingCountry = getCountryByPhoneNumber(defaultValue)
      console.log(matchingCountry)
      if (matchingCountry) {
        setDefaultCca2(matchingCountry.cca2)

        onChangeSelectedCountry(matchingCountry)
      } else {
        setDefaultCca2(null)
        onChangeSelectedCountry(null)
        onChangeText('', null)

        console.warn(
          "The default number provided (defaultValue) don't match with anyone country. Please, correct it to be shown in the input. For more information: https://github.com/AstrOOnauta/react-native-international-phone-number#intermediate-usage---typescript--default-phone-number-value",
        )
      }
    } else {
      if (!selectedCountry) {
        console.log('Please select a country')
        onChangeSelectedCountry({
          callingCode: '+55',
          cca2: 'BR',
          flag: 'flag-br',
          name: 'Brazil',
        })
      }
    }
  }, [defaultValue])

  useEffect(() => {
    if (defaultValue && selectedCountry && selectedCountry.cca2 === defaultCca2 && !rest.value) {
      const callingCode = selectedCountry.callingCode

      let phoneNumber = defaultValue

      if (callingCode === '+1' && selectedCountry.cca2 !== 'CA' && selectedCountry.cca2 !== 'US') {
        phoneNumber = defaultValue
          .replace(/\s/g, '')
          .substring(
            callingCode.length + 3,
            defaultValue.replace(/\D/g, '').length + callingCode.length,
          )
      } else if (callingCode === '+39' && selectedCountry.cca2 === 'VA') {
        phoneNumber = defaultValue
          .replace(/\s/g, '')
          .substring(
            callingCode.length + 5,
            defaultValue.replace(/\D/g, '').length + callingCode.length,
          )
      } else {
        phoneNumber = defaultValue
          .replace(/\s/g, '')
          .substring(
            callingCode.length,
            defaultValue.replace(/\D/g, '').length + callingCode.length,
          )
      }
      onChangeText(phoneNumber, callingCode)
    }
  }, [selectedCountry])

  const renderFlagButton = (country) => {
    console.log('renderFlagButton', country)
    return country.flag
  }
  return (
    <View
      style={[
        withDarkTheme
          ? {
              ...styles.darkContainer,
              backgroundColor: disabled ? '#858585' : styles.darkContainer.backgroundColor,
            }
          : {
              ...styles.lightContainer,
              backgroundColor: disabled ? '#E3E3E3' : styles.lightContainer.backgroundColor,
            },
        containerStyle ? containerStyle : {},
      ]}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <CountryPicker
        containerButtonStyle={[
          flagContainerBase,
          selectedCountry?.cca2 === 'VA' ? { width: 140 } : {},
          flagContainerStyle ? flagContainerStyle : {},
        ]}
        onSelect={onSelect}
        withFilter
        withAlphaFilter
        withCallingCode
        // withCallingCodeButton={selectedCountry || defaultCca2}
        theme={withDarkTheme ? DARK_THEME : DEFAULT_THEME}
        countryCode={selectedCountry ? selectedCountry.cca2 : defaultCca2}
        modalProps={disabled ? { visible: false } : {}}
      />
      <TouchableOpacity
        style={{
          marginLeft:Platform.OS === 'ios' ? 40 : 35,
          position: 'absolute',
          zIndex: -100,
        }}
        modalProps={disabled ? { visible: false } : {}}
        
       
      >
        {defaultCca2 ? (
          <MaterialIcons name="keyboard-arrow-up" size={24} color="#DDDDDD" />
        ) : (
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#DDDDDD" />
        )}
      </TouchableOpacity>

      <Text style={{ marginLeft: Platform.OS === 'ios' ? -38 : -40,color:'#DDDDDD' }}>{selectedCountry?.callingCode}</Text>
      <TextInput
        style={[
          withDarkTheme ? styles.darkInput : styles.lightInput,
          { width: containerWidth - 90 },
          inputStyle ? inputStyle : {},
        ]}
        placeholder={placeholder ? placeholder : 'Enter your Mobile Phone No.'}
        placeholderTextColor={
          placeholderTextColor ? placeholderTextColor : withDarkTheme ? '#CCCCCC' : '#DDDDDD'
        }
        selectionColor={
          selectionColor
            ? selectionColor
            : withDarkTheme
            ? 'rgba(255,255,255, .4)'
            : 'rgba(0 ,0 ,0 , .4)'
        }
        editable={!disabled}
        onChangeText={onChangeText}
        keyboardType="numeric"
        {...rest}
      />
    </View>
  )
}

const containerBase = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  // borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: 16,
  width: '100%',
  height: 45,
  paddingHorizontal:5,
}

const flagContainerBase = {
  width: 90,
  height: '99%',
  //   alignItems: 'center',
  marginLeft: 5,
  justifyContent: 'center',
  zIndex: 99999,
}

const inputBase = {
  width: Dimensions.get('window').width - 140,
  paddingVertical: 8,
  paddingHorizontal: 10,
  fontSize: 12,
}

const styles = StyleSheet.create({
  lightContainer: {
    ...containerBase,
    backgroundColor: '#2c44d5',
    // borderColor: '#AAAAAA',
  },
  darkContainer: {
    ...containerBase,
    backgroundColor: '#575757',
    // borderColor: '#F3F3F3',
  },
  lightInput: {
    ...inputBase,
    color: '#0A0A0A',
  },
  darkInput: {
    ...inputBase,
    color: '#F3F3F3',
  },
})

export {
  PhoneInput,
  getAllCountries,
  getCountryByPhoneNumber,
  getCountryByCca2,
  getCountriesByCallingCode,
  getCountriesByName,
}
