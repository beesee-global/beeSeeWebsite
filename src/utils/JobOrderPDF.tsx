import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, Font } from "@react-pdf/renderer";
import headerImage from "../assets/header.png";
import footerImage from "../assets/footer.png";
 

// Optional: custom font registration if needed
// Font.register({ family: 'Helvetica-Bold', src: 'path/to/Helvetica-Bold.ttf' });

interface JobOrderData { 
  ticket_id: string;
  company: string;
  full_name: string;
  city: string;
  phone: string;
  email: string;
  location: string;
  device_type: string;
  issue_type: string;
  serial_number: string;
  questions: string;
  technician_name: string; 
}

const BORDER_COLOR = "#000000";

const styles = StyleSheet.create({
    page: {
        fontSize: 9,
        paddingTop: 55,
        paddingBottom: 50,
        paddingHorizontal: 50,
        fontFamily: "Helvetica",
    },
    headerImage: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: 70,
    },
    footerImage: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 180,
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 5,
    },
    title: {
        fontSize: 13,
        fontFamily: "Helvetica-Bold",
    },
    subtitle: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
    },
    section: {
        borderWidth: 0.5,
        borderColor: BORDER_COLOR,
        backgroundColor: "#e5e5e5",
        padding: 6, 
        alignItems: "center",
    },
    sectiona: {
        borderWidth: 0.5,
        borderColor: BORDER_COLOR,
        backgroundColor: "#e5e5e5",
        padding: 6, 
        alignItems: "center",
        marginTop: 10,
    },
    sectionText: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
    },
    row: {
        flexDirection: "row",
        borderWidth: 0.5,
        borderColor: BORDER_COLOR,
        borderTopWidth: 0, 
        minHeight: 20,
    },
    label: {
        width: 150,
        fontFamily: "Helvetica-Bold",
        padding: 5,
        borderRightWidth: 0.5,
        borderRightColor: BORDER_COLOR,
    },
    dateLabel: {
        width: 80,
        paddingLeft: 5,
        borderLeftWidth: 0.5,
        borderLeftColor: BORDER_COLOR,
        marginLeft: 100,
    },
    labelBold: {
        fontFamily: "Helvetica-Bold",
        padding: 5
    },
    value: { 
        paddingLeft: 5,
        paddingTop: 5,
    },
    issueBox: {
        minHeight: 100,
        alignItems: "flex-start",
    },
    statusRow: {
        flexDirection: "row",
        borderWidth: 0.5,
        borderColor: BORDER_COLOR,
        borderTopWidth: 0, 
    },
    statusContent: {
        flex: 1,
        padding: 5,
    },
    statusOption: {
        fontSize: 9,
        marginBottom: 2,
    },
    statusLine: {
        borderBottomWidth: 0.5,
        borderBottomColor: BORDER_COLOR,
        marginVertical: 2,
        marginTop: 10,
        marginLeft: 10,
    },
    acknowledgmentBox: {
        flexDirection: "row",
        borderWidth: 0.5,
        borderColor: BORDER_COLOR,
        borderTopWidth: 0,
        minHeight: 0 
    },
    acknowledgmentLabel: {
        width: 150,
        padding: 5,
        borderRightWidth: 0.5,
        borderRightColor: BORDER_COLOR,
    },
    acknowledgmentContent: {
        flex: 1,
        paddingLeft: 5,
        marginTop:40,
        justifyContent: "space-between",
    },
    signatureText: {
        fontSize: 9,
        marginBottom: 10,
    },
    signatureLine: {
        borderBottomWidth: 0.5,
        borderBottomColor: BORDER_COLOR,
        width: 110,
        marginBottom: 5,
    },
    dateText: {
        fontSize: 9,
        paddingLeft: 40
    },
    acknowledgeLayout: {
        flexDirection: "row",  
        marginRight: 2 
    },
});

const JobOrderPDF = ({ data }: { data: JobOrderData }) => {
  return (
     <Document>
        <Page size="A4" style={styles.page}>
        {/* Header and Footer Images */}
        <Image src={headerImage} style={styles.headerImage} />
        <Image src={footerImage} style={styles.footerImage} />

        {/* Title */}
        <View style={styles.titleContainer}>
            <Text style={styles.title}>JOB ORDER</Text>
        </View>
        <View style={styles.titleContainer}>
            <Text style={styles.subtitle}>{data.ticket_id}</Text>
        </View>

        {/* INFORMATION DETAILS */}
        <View style={styles.section}>
            <Text style={styles.sectionText}>INFORMATION DETAILS</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>COMPANY/ INSTITUTION:</Text>
            <Text style={styles.value}>{data.company}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>NAME:</Text>
            <Text style={styles.value}>{data.full_name}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>CITY:</Text>
            <Text style={styles.value}>{data.city}</Text>
        </View> 
        <View style={styles.row}>
            <Text style={styles.label}>CONTACT:</Text>
            <Text style={styles.value}>{data.phone}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>EMAIL:</Text>
            <Text style={styles.value}>{data.email}</Text>
        </View>

        {/* DEVICE DETAILS */}
        <View style={styles.section}>
            <Text style={styles.sectionText}>DEVICE DETAILS</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>DEVICE TYPE:</Text>
            <Text style={styles.value}>{data.device_type}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>DEVICE MODEL:</Text>
            <Text style={styles.value}>{data.issue_type}</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>SERIAL NUMBER:</Text>
            <Text style={styles.value}>{data.serial_number}</Text>
        </View>
        
        <View style={styles.row}>
            <Text style={styles.label}>LOCATION:</Text>
            <Text style={styles.value}>{data.location}</Text>
        </View>

        {/* ISSUE REPORT */}
        <View style={styles.section}>
            <Text style={styles.sectionText}>ISSUE REPORT</Text>
        </View>
        
        {/* Description label */}
        <View style={styles.row}>
            <Text style={styles.labelBold}>
            Please describe the issue you are experiencing with the device:
            </Text>
        </View>

        {/* Issue text box */}
        <View style={[styles.row, styles.issueBox]}>
            <Text style={styles.value}>{data.questions}</Text>
        </View>

        {/* DIAGNOSTIC */}
        <View style={styles.section}>
            <Text style={styles.sectionText}>DIAGNOSTIC</Text>
        </View>

        {/* Technician / Date Row */}
        <View style={styles.row}>
            <Text style={styles.label}>TECHNICIAN NAME:</Text>
            <Text style={styles.value}>{data.technician_name}</Text>
            <Text style={[styles.label, styles.dateLabel]}>Date Checked:</Text>
            <Text style={styles.value}>{""}</Text>
        </View>

        <View style={styles.row}>
            <Text style={styles.label}>INITIAL SOLUTION:</Text>
            <Text style={styles.value}></Text>
        </View>

        {/* STATUS */}
        <View style={styles.statusRow}>
            <Text style={styles.label}>STATUS:</Text>
            <View style={styles.statusContent}>
                <Text style={styles.statusOption}>[ ] Repaired and in good physically condition:</Text>
                <Text style={styles.statusOption}>[ ] Repaired but with deferred recommendations:</Text>
                <View style={styles.statusLine} />
                <Text style={styles.statusOption}>[ ] Unable to repair due to:</Text>
                <View style={styles.statusLine} />
                <Text style={styles.statusOption}>[ ] Pull out due to:</Text>
                <View style={styles.statusLine} />
                <Text style={styles.statusOption}>[ ] For replacement:</Text>
                <View style={styles.statusLine} />
            </View>
        </View>

        {/* ACKNOWLEDGMENT */}
        <View style={styles.acknowledgmentBox} >
            <View style={styles.acknowledgmentLabel}>
            	<Text style={styles.labelBold}>ACKNOWLEDGMENT:</Text>
            </View>
            <View style={styles.acknowledgmentContent}>
            	<View style={styles.signatureLine} />
                <View style={styles.acknowledgeLayout}>
                  <Text style={styles.signatureText}>Signature Over Name</Text>
                  <Text style={styles.dateText}>Date:</Text>  
              </View>
            </View>
        </View>
        </Page>
     </Document>
  );
};

export default JobOrderPDF;
