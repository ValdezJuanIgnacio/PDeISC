import React, { useState } from "react";
import { Modal, View, Text, Button } from "react-native";
import ComponenteGuia from "./ComponenteGuia";
import { styles } from "../styles/styles";

const ModalDemo = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  return (
    <ComponenteGuia
      title="10. Modal"
      explanation="Presenta contenido temporal sobre la vista actual."
    >
      <Button
        title="Mostrar Modal"
        onPress={() => setIsModalVisible(true)}
        color="#facc15"
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contenido del Modal</Text>
            <Text>Esto aparece encima de toda la aplicación.</Text>
            <Button
              title="Cerrar Modal"
              onPress={() => setIsModalVisible(false)}
              color="#ef4444"
            />
          </View>
        </View>
      </Modal>
    </ComponenteGuia>
  );
};

export default ModalDemo;
