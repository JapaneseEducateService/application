import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const GrammarModal = ({visible, onClose, grammar}) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{grammar.grammar}</Text>
          <ScrollView style={styles.contentContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>意味</Text>
              <Text style={styles.sectionText}>{grammar.meaning}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>説明</Text>
              <Text style={styles.sectionText}>{grammar.explain}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>活用</Text>
              <Text style={styles.sectionText}>{grammar.conjunction}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>例文</Text>
              {grammar.grammar_examples.map(example => (
                <View key={example.id} style={styles.exampleContainer}>
                  {example.example.split('<br>').map((line, index) => (
                    <Text key={index} style={styles.exampleText}>
                      {line}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>閉じる</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    height:'80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  contentContainer: {
    width: '100%',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 5,
  },
  sectionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 14,
    marginBottom: 10,
    paddingLeft: 10,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#006fff',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight:'bold',
  },
});

export default GrammarModal;
