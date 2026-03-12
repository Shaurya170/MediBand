import colors from '@/styles/colors'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const about = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        MediBand was created as a way for people to remember to take their 
        medcations whether it is a prescription, supplement, or over-the-counter
        medication. The insipiration for MediBand came from a common problem of 
        people forgetting to take their medication. Current reminding devices 
        are either too bulky or not reliable. MediBand is a braclet that is both 
        reliable and stylish. With MediBand you will look your best and feel your best.
        </Text>
    </View>
  )
}

export default about

const styles = StyleSheet.create({
    container:{
    flex: 1,
    backgroundColor: colors.background,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",

  },
  text:{
    fontSize: 40,
    fontFamily: "Jua",
    color: colors.text
  },
})