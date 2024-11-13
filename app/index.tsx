import { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal, ScrollView } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Fontisto from '@expo/vector-icons/Fontisto';
import Feather from '@expo/vector-icons/Feather';
import { Link } from 'expo-router';

interface SinglePlace {
  latitude: number;
  longitude: number;
}

interface AllPlaces {
  fsq_id: string;
  name: string;
}

export default function App() {
  const [location, setLocation] = useState<null | any>(null);
  const [errorMsg, setErrorMsg] = useState<null | string>(null);
  const [search, setSearch] = useState('');
  const [places, setPlaces] = useState<null | AllPlaces[]>(null);
  const [singlesearchPlace, setsinglesearchPlace] = useState<null | SinglePlace>(null);
  const [region, setRegion] = useState<any>(null);
  const [direction, setDirection] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [showPrices, setShowPrices] = useState<boolean>(false); // New state to show prices

  // Updated transport options with prices
  const transportOptions = [
    { id: '1', type: <MaterialCommunityIcons name="motorbike" size={24} color="black" />, icon: 'motorbike', price: 200 },
    { id: '2', type: <MaterialCommunityIcons name="car" size={24} color="black" />, icon: 'car', price: 500 },
    { id: '3', type: <Fontisto name="automobile" size={24} color="black" />, icon: 'car', price: 700 },
    { id: '4', type: <Feather name="truck" size={24} color="black" />, icon: 'truck', price: 1000 }
  ];

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });
    })();
  }, []);

  const searchPlaces = () => {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: 'fsq3qbL9ORBTq2ZaS6TUHxpAQZNDJjTlkT2lBeAynwmhZ8I='
      }
    };

    fetch(`https://api.foursquare.com/v3/places/search?query=${search}&ll=${location.coords.latitude}%2C${location.coords.longitude}&radius=100000`, options)
      .then(res => res.json())
      .then(res => {
        setPlaces(res.results);
        setModalVisible(true); // Show modal with suggestions
        setShowPrices(true); // Show prices after a successful search
      })
      .catch(err => console.error(err));
  };

  const singlePlace = (item: any) => {
    setModalVisible(false); // Close modal
    setPlaces(null);
    setsinglesearchPlace({
      latitude: item.geocodes.main.latitude,
      longitude: item.geocodes.main.longitude,
    });
    setRegion({
      latitude: item.geocodes.main.latitude,
      longitude: item.geocodes.main.longitude,
      latitudeDelta: 0.001,
      longitudeDelta: 0.001,
    });
    setDirection(true); // Enable direction when a place is selected
  };

  return (

    
    <View style={styles.container}>
      {location && (
        <MapView region={region} onRegionChangeComplete={setRegion} style={styles.map}>
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          />
          {singlesearchPlace && (
            <Marker
              coordinate={{
                latitude: singlesearchPlace.latitude,
                longitude: singlesearchPlace.longitude,
              }}
            />
          )}
          {singlesearchPlace && direction && (
            <Polyline
              coordinates={[
                { latitude: location.coords.latitude, longitude: location.coords.longitude },
                { latitude: singlesearchPlace.latitude, longitude: singlesearchPlace.longitude },
              ]}
              strokeWidth={5}
              strokeColor="#000000"
            />
          )}
        </MapView>
      )}

      {/* Transportation Options List */}
      <FlatList
        data={transportOptions}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.transportOption}>
            <Text style={styles.textList}>{item.type}</Text>
            {showPrices && <Text style={styles.priceText}>{item.price}</Text>}
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        style={styles.transportList}
      />

      {/* Search Input and Button */}
      <View style={styles.searchContainer}>
        <TextInput  
          style={styles.input}
          onChangeText={setSearch}
          value={search}
          placeholder="Search for a location"
        />
        <TouchableOpacity onPress={searchPlaces} style={styles.button}>
          <Text>Search</Text>
        </TouchableOpacity>
        <View>
          <View>
          <TouchableOpacity style={styles.button2}>
            <Link href={'/driver'}>
          <Text style={{
            color:"#fff",
            fontWeight:'bold'
          }}>Find A Driver</Text>
          </Link>
        </TouchableOpacity>
          </View>
      </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <FlatList
            data={places}
            renderItem={({ item }: { item: { name: string } }) => (
              <TouchableOpacity onPress={() => singlePlace(item)} style={styles.listItem}>
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item: { fsq_id: string }) => item.fsq_id}
          />
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={{ color: 'white' }}>Close</Text>
          </TouchableOpacity>

        </View>
      </Modal>
    </View>
  );
}

// Updated Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor:'#33ff26'
  },
  map: {
    width: '100%',
    height: '50%',
  },
  transportList: {
    marginTop: 10,
    marginBottom: 10,
  },
  transportOption: {
    alignItems: 'center',
    marginHorizontal: 10,
    borderColor:'#33ff26'
  },
  searchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 70,
  },
  input: {
    height: 40,
    width: 350,
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    width: 350,
    marginBottom: 10,
  },
  button2: {
    alignItems: 'center',
    backgroundColor: '#33ff30',
    textDecorationColor:'#ffffff',
    padding: 15,
    borderRadius:20,
    width: 150,
  },
  priceText: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  modalView: {
    marginTop: '50%',
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  textList: {
    marginLeft: 5,
    marginRight: 10,
    padding: 10,
    borderWidth: 1,
    backgroundColor: '#33ff26',
    borderColor: 'green',
  },
});
