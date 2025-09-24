import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {flex:1, backgroundColor:'#fff'},
  topBar: {height:64, flexDirection:'row', alignItems:'center', paddingHorizontal:8},
  topLeft:{width:40}, topRight:{width:40}, topCenter:{flex:1, alignItems:'center'},
  back:{fontSize:24}, settings:{fontSize:20},
  fab:{backgroundColor:'#EEE', paddingHorizontal:12, paddingVertical:6, borderRadius:20},
  fabLabel:{color:'#333'},
  cameraArea:{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#000'},
  placeholder:{width:'90%', height:'70%', justifyContent:'center', alignItems:'center', backgroundColor:'#222'},
  placeholderText:{color:'#fff'},
  preview:{width:'100%', height:'100%'},
  controls:{height:120, justifyContent:'center', alignItems:'center'},
  captureBtn:{backgroundColor:'#4CAF50', paddingHorizontal:24, paddingVertical:12, borderRadius:30},
  captureText:{color:'#fff', fontSize:18},
  selected:{marginBottom:8}
  ,menuItem:{backgroundColor:'#fff', padding:12, marginVertical:6, borderRadius:8, alignItems:'center'}
});
