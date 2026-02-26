import Map "mo:core/Map";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import Stripe "stripe/stripe";
import Storage "blob-storage/Storage";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    // Data structures from the old actor
    userProfiles : Map.Map<Principal, { displayName : Text; isTechnician : Bool; avatar : ?Storage.ExternalBlob }>;
    loginEvents : Map.Map<Nat, { name : Text; role : Text; email : Text; timestamp : Int; principalId : Text }>;
    messages : Map.Map<Nat, {
      messageId : Nat;
      sender : Principal;
      recipient : Principal;
      content : Text;
      timestamp : Int;
      delivered : Bool;
      isRead : Bool;
      attachment : ?Storage.ExternalBlob;
    }>;
    supportTickets : Map.Map<Nat, {
      ticketId : Nat;
      customer : Principal;
      technician : Principal;
      status : { #open; #inProgress; #resolved };
      messages : [{ messageId : Nat; sender : Principal; recipient : Principal; content : Text; timestamp : Int; delivered : Bool; isRead : Bool; attachment : ?Storage.ExternalBlob }];
      feedback : ?{ rating : Nat; comment : Text };
      createdAt : Int;
      updatedAt : Int;
    }>;
    paymentRecords : Map.Map<Text, {
      paymentId : Text;
      customer : Principal;
      amount : Nat;
      currency : Text;
      status : { #pending; #completed; #failed };
      timestamp : Int;
    }>;
    technicianAvailability : Map.Map<Principal, {
      technician : Principal;
      isAvailable : Bool;
      lastUpdated : Int;
    }>;
    chatTranscripts : Map.Map<Nat, {
      customer : Principal;
      technician : ?Principal;
      messages : [{
        messageId : Nat;
        sender : Principal;
        recipient : Principal;
        content : Text;
        timestamp : Int;
        delivered : Bool;
        isRead : Bool;
        attachment : ?Storage.ExternalBlob;
      }];
      createdAt : Int;
      endedAt : Int;
    }>;
    chatFeedback : Map.Map<Nat, {
      sessionId : Nat;
      customer : Principal;
      rating : Int;
      comment : Text;
      submittedAt : Int;
    }>;
    checkoutSessions : Map.Map<Text, Principal>;
    completedPayments : Map.Map<Principal, Bool>;
    messageIdCounter : Map.Map<Nat, Nat>;
    ratingIdCounter : Map.Map<Nat, Nat>;
    loginEventIdCounter : Map.Map<Nat, Nat>;
    lastMessageTime : Map.Map<Principal, Int>;
    lastTicketTime : Map.Map<Principal, Int>;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, { displayName : Text; isTechnician : Bool; avatar : ?Storage.ExternalBlob }>;
    loginEvents : Map.Map<Nat, { name : Text; role : Text; email : Text; timestamp : Int; principalId : Text }>;
    messages : Map.Map<Nat, {
      messageId : Nat;
      sender : Principal;
      recipient : Principal;
      content : Text;
      timestamp : Int;
      delivered : Bool;
      isRead : Bool;
      attachment : ?Storage.ExternalBlob;
    }>;
    supportTickets : Map.Map<Nat, {
      ticketId : Nat;
      customer : Principal;
      technician : Principal;
      status : { #open; #inProgress; #resolved };
      messages : [{ messageId : Nat; sender : Principal; recipient : Principal; content : Text; timestamp : Int; delivered : Bool; isRead : Bool; attachment : ?Storage.ExternalBlob }];
      feedback : ?{ rating : Nat; comment : Text };
      createdAt : Int;
      updatedAt : Int;
    }>;
    paymentRecords : Map.Map<Text, {
      paymentId : Text;
      customer : Principal;
      amount : Nat;
      currency : Text;
      status : { #pending; #completed; #failed };
      timestamp : Int;
    }>;
    technicianAvailability : Map.Map<Principal, {
      technician : Principal;
      isAvailable : Bool;
      lastUpdated : Int;
    }>;
    chatTranscripts : Map.Map<Nat, {
      customer : Principal;
      technician : ?Principal;
      messages : [{
        messageId : Nat;
        sender : Principal;
        recipient : Principal;
        content : Text;
        timestamp : Int;
        delivered : Bool;
        isRead : Bool;
        attachment : ?Storage.ExternalBlob;
      }];
      createdAt : Int;
      endedAt : Int;
    }>;
    chatFeedback : Map.Map<Nat, {
      sessionId : Nat;
      customer : Principal;
      rating : Int;
      comment : Text;
      submittedAt : Int;
    }>;
    checkoutSessions : Map.Map<Text, Principal>;
    completedPayments : Map.Map<Principal, Bool>;
    messageIdCounter : Map.Map<Nat, Nat>;
    ratingIdCounter : Map.Map<Nat, Nat>;
    loginEventIdCounter : Map.Map<Nat, Nat>;
    lastMessageTime : Map.Map<Principal, Int>;
    lastTicketTime : Map.Map<Principal, Int>;
  };

  public func run(old : OldActor) : NewActor { old };
};
